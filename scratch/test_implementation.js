// Verification test script for LaserUVCreatives implementation
const http = require("http");

async function post(path, body, cookie = "") {
  return new Promise((resolve, reject) => {
    const data = JSON.stringify(body);
    const req = http.request(
      {
        hostname: "localhost",
        port: 3000,
        path,
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Content-Length": Buffer.byteLength(data),
          ...(cookie ? { Cookie: cookie } : {}),
        },
      },
      (res) => {
        let resData = "";
        res.on("data", (chunk) => (resData += chunk));
        res.on("end", () => {
          const setCookie = res.headers["set-cookie"];
          let parsed;
          try {
            parsed = JSON.parse(resData);
          } catch {
            parsed = resData;
          }
          resolve({ status: res.statusCode, data: parsed, cookies: setCookie });
        });
      }
    );
    req.on("error", reject);
    req.write(data);
    req.end();
  });
}

async function get(path, cookie = "") {
  return new Promise((resolve, reject) => {
    const req = http.request(
      {
        hostname: "localhost",
        port: 3000,
        path,
        method: "GET",
        headers: {
          ...(cookie ? { Cookie: cookie } : {}),
        },
      },
      (res) => {
        let resData = "";
        res.on("data", (chunk) => (resData += chunk));
        res.on("end", () => {
          let parsed;
          try {
            parsed = JSON.parse(resData);
          } catch {
            parsed = resData;
          }
          resolve({ status: res.statusCode, data: parsed, headers: res.headers });
        });
      }
    );
    req.on("error", reject);
    req.end();
  });
}

async function runTests() {
  console.log("=== 1. Testing Customer Registration & Validation ===");
  const invalidReg = await post("/api/auth/register", {
    fullName: "A",
    email: "not-an-email",
    password: "short",
    confirmPassword: "mismatch",
  });
  console.log("Validation test (invalid fields):", invalidReg.status, invalidReg.data.error);

  console.log("\n=== 2. Testing Contact Form & Spam Protection ===");
  const honeypotRes = await post("/api/contact", {
    name: "Spam Bot",
    email: "bot@spam.com",
    subject: "Buy cheap pills",
    message: "This is a spam message that should be caught by honeypot",
    honeypot: "http://spam.com",
  });
  console.log("Honeypot trap status:", honeypotRes.status, honeypotRes.data);

  const contactWithoutEmailProvider = await post("/api/contact", {
    name: "Tariq Mahmood",
    email: "tariq.mahmood@example.com",
    phone: "03001234567",
    subject: "Corporate Gift Inquiry for 100 Wooden Pens",
    message: "Assalam-o-Alaikum, we need a quotation for 100 rosewood pens with executive gift boxes in Lahore.",
  });
  console.log("Contact submission response without email credentials (must fail honestly, never simulate success):");
  console.log("Status:", contactWithoutEmailProvider.status);
  console.log("Result:", contactWithoutEmailProvider.data);

  console.log("\n=== 3. Testing Admin Server-Side Login ===");
  const badAdminLogin = await post("/api/admin/login", {
    email: "admin@laseruvcreatives.com",
    password: "wrongpassword",
  });
  console.log("Bad admin credentials test:", badAdminLogin.status, badAdminLogin.data.error);

  const validAdminLogin = await post("/api/admin/login", {
    email: "admin@laseruvcreatives.com",
    password: "Admin@LaserUV2026!",
  });
  console.log("Valid admin login:", validAdminLogin.status, validAdminLogin.data.success ? "SUCCESS" : "FAILED");
  const adminCookie = validAdminLogin.cookies ? validAdminLogin.cookies.map(c => c.split(';')[0]).join('; ') : "";
  console.log("Admin cookie received:", Boolean(adminCookie));

  console.log("\n=== 4. Testing Admin Role Authorization Guard ===");
  const adminMeWithAuth = await get("/api/admin/me", adminCookie);
  console.log("Admin verify with session:", adminMeWithAuth.status, adminMeWithAuth.data.admin?.role);

  const adminMeWithoutAuth = await get("/api/admin/me");
  console.log("Admin verify without session (must be 401):", adminMeWithoutAuth.status);

  console.log("\n=== 5. Testing Persistent Database Products & Multiple Images ===");
  const productsRes = await get("/api/products");
  console.log("Products in database:", productsRes.status, "Count:", productsRes.data.products?.length);
  if (productsRes.data.products && productsRes.data.products.length > 0) {
    const p1 = productsRes.data.products[0];
    console.log("Sample product:", p1.name, "| Price:", p1.price, "| Images:", p1.images?.length, "| Stock:", p1.inStock);
  }

  console.log("\n=== 6. Testing Orders API & Customer Isolation ===");
  const ordersAsAdmin = await get("/api/orders", adminCookie);
  console.log("Orders retrieved by admin:", ordersAsAdmin.status, "Count:", ordersAsAdmin.data.orders?.length);

  const ordersUnauthorized = await get("/api/orders");
  console.log("Orders retrieved unauthenticated (must be 401):", ordersUnauthorized.status);

  console.log("\n=== All Verification Tests Completed ===");
}

runTests().catch(console.error);
