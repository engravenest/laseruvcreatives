import { NextRequest, NextResponse } from "next/server";
import { serverDb } from "@/lib/serverDb";
import { sendContactFormEmail } from "@/lib/email";
import { isValidPakistaniPhone } from "@/lib/utils";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { name, email, phone, subject, message, honeypot } = body;

    // 1. Spam protection: Honeypot check (hidden field)
    if (honeypot && String(honeypot).trim().length > 0) {
      // Silently discard spam bot submissions without revealing honeypot detection
      return NextResponse.json({ success: true, message: "Thank you for contacting us." });
    }

    // 2. Field validation
    if (!name || typeof name !== "string" || name.trim().length < 2) {
      return NextResponse.json({ error: "Please enter your name (minimum 2 characters)." }, { status: 400 });
    }

    if (!email || typeof email !== "string" || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
      return NextResponse.json({ error: "Please enter a valid email address." }, { status: 400 });
    }

    if (phone && phone.trim().length > 0 && !isValidPakistaniPhone(phone)) {
      return NextResponse.json(
        { error: "Please enter a valid Pakistani mobile number (e.g. 03001234567 or +923001234567)." },
        { status: 400 }
      );
    }

    if (!subject || typeof subject !== "string" || subject.trim().length < 3) {
      return NextResponse.json({ error: "Please enter an inquiry subject (minimum 3 characters)." }, { status: 400 });
    }

    if (!message || typeof message !== "string" || message.trim().length < 10) {
      return NextResponse.json({ error: "Please enter a detailed message (minimum 10 characters)." }, { status: 400 });
    }

    // 3. Save submission to persistent database
    const saved = serverDb.createContactSubmission({
      name: name.trim(),
      email: email.toLowerCase().trim(),
      phone: phone ? phone.trim() : undefined,
      subject: subject.trim(),
      message: message.trim(),
    });

    // 4. Send email through configured provider (Resend or SMTP) to engravenest@gmail.com
    // Only return success AFTER email provider accepts the message
    try {
      await sendContactFormEmail({
        name: name.trim(),
        email: email.toLowerCase().trim(),
        phone: phone ? phone.trim() : undefined,
        subject: subject.trim(),
        message: message.trim(),
      });
    } catch (emailError: any) {
      console.error("Contact email dispatch error:", emailError);
      return NextResponse.json(
        {
          error: `Could not send message: ${emailError.message || "Email provider rejected message"}. Your inquiry was saved internally.`,
        },
        { status: 502 }
      );
    }

    return NextResponse.json({
      success: true,
      message: "Thank you! Your message has been sent to our team at engravenest@gmail.com. We will respond within 24 hours.",
      id: saved.id,
    });
  } catch (error: any) {
    console.error("Contact API route error:", error);
    return NextResponse.json({ error: "Failed to submit contact form. Please try again." }, { status: 500 });
  }
}
