const fs=require('node:fs'),vm=require('node:vm'),ts=require('typescript'),assert=require('node:assert/strict');
const jsx=(type,props)=>({type,props});
function load(path,deps,globals={}){const exports={};vm.runInNewContext(ts.transpileModule(fs.readFileSync(path,'utf8'),{compilerOptions:{module:ts.ModuleKind.CommonJS,jsx:ts.JsxEmit.ReactJSX,target:ts.ScriptTarget.ES2020}}).outputText,{exports,require:n=>deps[n]||({jsx,jsxs:jsx,Fragment:'fragment'}),...globals});return exports;}
let state,hydrated=false,effects=[],ref={current:false},stored=null,writes=[];
const hooks={createContext:()=>({Provider:'provider'}),useContext:()=>{},useCallback:f=>f,useMemo:f=>f(),useRef:()=>ref,useState:()=>[hydrated,v=>hydrated=v],useEffect:f=>effects.push(f),useReducer:(reducer,initial)=>{state??=initial;return[state,action=>state=reducer(state,action)];}};
const cart=load('src/context/CartContext.tsx',{react:hooks},{localStorage:{getItem:()=>stored,setItem:(_,v)=>{stored=v;writes.push(v);}}});
const product={id:'pen',slug:'test-pen',name:'Test Pen',price:1000,inStock:true,images:['/pen.jpg'],variants:[{id:'color',options:[{id:'black',inStock:true}]}]};
let value=cart.CartProvider({children:null}).props.value;
const featured=load('src/components/home/FeaturedProducts.tsx',{react:{useState:v=>[v,()=>{}],useEffect:()=>{},useRef:()=>({current:null})},'@/context/CartContext':{useCart:()=>value},'@/lib/storeSync':{useLiveProducts:()=>[product]},'@/data/products':{PRODUCTS:[product]},'@/components/product/ProductCard':{default:'card'},'next/link':{default:'link'}},{setTimeout:()=>1,clearTimeout:()=>{}});
function findCard(node){if(!node||typeof node!=='object')return; if(node.type==='card')return node;const children=node.props?.children;for(const child of [children].flat(Infinity)){const found=findCard(child);if(found)return found;}}
const tree=featured.default({});findCard(tree).props.onAddToCart(product);
value=cart.CartProvider({children:null}).props.value;assert.equal(value.itemCount,1);assert.equal(value.items[0].productId,'pen');assert.equal(value.items[0].selectedVariants.color,'black');
findCard(tree).props.onAddToCart(product);value=cart.CartProvider({children:null}).props.value;assert.equal(value.itemCount,2);assert.equal(value.items.length,1);
// Simulate reload with saved guest cart, ensuring initial empty state never overwrites it.
stored=JSON.stringify(value.items);state=undefined;hydrated=false;ref={current:false};effects=[];
cart.CartProvider({children:null});effects.forEach(effect=>effect());assert.equal(writes.length,0);
effects=[];value=cart.CartProvider({children:null}).props.value;effects.forEach(effect=>effect());assert.equal(value.itemCount,2);assert.equal(JSON.parse(stored)[0].quantity,2);
console.log('PASS: home Add to Cart updates shared guest count, merges repeats, and preserves cart through hydration/reload.');
