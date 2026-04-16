/* ═══════════════════════════════════════════════
   Botanic Care – Cart & Wishlist (Shopify Storefront API)
   Shared across all pages via <script src="/botanic-cart.js">
   ═══════════════════════════════════════════════ */
(function(){
  var DOMAIN = 'ewxph1-uk.myshopify.com';
  var TOKEN  = '25b03034e9b7d0c606b2744d210a4cab';
  var API    = 'https://'+DOMAIN+'/api/2024-01/graphql.json';

  function gql(query, variables){
    return fetch(API,{
      method:'POST',
      headers:{'Content-Type':'application/json','X-Shopify-Storefront-Access-Token':TOKEN},
      body:JSON.stringify({query:query, variables:variables||{}})
    }).then(function(r){ return r.json(); });
  }

  /* ── CART ── */
  var CART_KEY = 'botanic_cart_id';

  function getCartId(){ return localStorage.getItem(CART_KEY); }
  function setCartId(id){ localStorage.setItem(CART_KEY, id); }

  var CART_FRAGMENT = 'fragment CF on Cart { id checkoutUrl totalQuantity cost { totalAmount { amount currencyCode } } lines(first:50){ edges{ node{ id quantity merchandise { ... on ProductVariant { id title price { amount currencyCode } product { title handle images(first:1){ edges{ node{ url } } } } } } } } } }';

  function createCart(variantId, qty){
    var q = 'mutation($lines:[CartLineInput!]!){ cartCreate(input:{lines:$lines}){ cart { ...CF } userErrors { field message } } } '+CART_FRAGMENT;
    return gql(q, {lines:[{merchandiseId:variantId, quantity:qty||1}]}).then(function(json){
      if(json.data && json.data.cartCreate && json.data.cartCreate.cart){
        var cart = json.data.cartCreate.cart;
        setCartId(cart.id);
        return cart;
      }
      console.error('cartCreate errors', json);
      return null;
    });
  }

  function fetchCart(){
    var id = getCartId();
    if(!id) return Promise.resolve(null);
    var q = 'query($id:ID!){ cart(id:$id){ ...CF } } '+CART_FRAGMENT;
    return gql(q, {id:id}).then(function(json){
      if(json.data && json.data.cart) return json.data.cart;
      localStorage.removeItem(CART_KEY);
      return null;
    });
  }

  function addToCart(variantId, qty){
    var id = getCartId();
    if(!id){
      return createCart(variantId, qty||1);
    }
    var q = 'mutation($cartId:ID!,$lines:[CartLineInput!]!){ cartLinesAdd(cartId:$cartId,lines:$lines){ cart { ...CF } userErrors { field message } } } '+CART_FRAGMENT;
    return gql(q,{cartId:id, lines:[{merchandiseId:variantId, quantity:qty||1}]}).then(function(json){
      if(json.data && json.data.cartLinesAdd && json.data.cartLinesAdd.cart){
        return json.data.cartLinesAdd.cart;
      }
      localStorage.removeItem(CART_KEY);
      return createCart(variantId, qty||1);
    });
  }

  function updateCartLine(lineId, qty){
    var id = getCartId();
    if(!id) return Promise.resolve(null);
    var q = 'mutation($cartId:ID!,$lines:[CartLineUpdateInput!]!){ cartLinesUpdate(cartId:$cartId,lines:$lines){ cart { ...CF } userErrors { field message } } } '+CART_FRAGMENT;
    return gql(q,{cartId:id, lines:[{id:lineId, quantity:qty}]});
  }

  function removeCartLine(lineId){
    var id = getCartId();
    if(!id) return Promise.resolve(null);
    var q = 'mutation($cartId:ID!,$lineIds:[ID!]!){ cartLinesRemove(cartId:$cartId,lineIds:$lineIds){ cart { ...CF } userErrors { field message } } } '+CART_FRAGMENT;
    return gql(q,{cartId:id, lineIds:[lineId]}).then(function(json){
      if(json.data && json.data.cartLinesRemove) return json.data.cartLinesRemove.cart;
      return null;
    });
  }

  /* ── WISHLIST (localStorage) ── */
  var WISH_KEY = 'botanic_wishlist';

  function getWishlist(){
    try { return JSON.parse(localStorage.getItem(WISH_KEY)) || []; } catch(e){ return []; }
  }

  function isWished(handle){
    return getWishlist().indexOf(handle) !== -1;
  }

  function toggleWish(handle){
    var list = getWishlist();
    var idx = list.indexOf(handle);
    if(idx === -1) list.push(handle);
    else list.splice(idx, 1);
    localStorage.setItem(WISH_KEY, JSON.stringify(list));
    return idx === -1;
  }

  /* ── UI HELPERS ── */
  function formatPrice(priceObj){
    var n = parseFloat(priceObj.amount);
    return priceObj.currencyCode === 'GTQ' ? 'Q'+n.toFixed(0) : priceObj.currencyCode+' '+n.toFixed(2);
  }

  function updateCartBadge(cart){
    var badges = document.querySelectorAll('.cart-count');
    var qty = cart ? cart.totalQuantity : 0;
    badges.forEach(function(b){
      b.textContent = qty;
      b.style.display = qty > 0 ? '' : 'none';
    });
  }

  /* ── CART DRAWER UI ── */
  function buildCartDrawer(){
    if(document.getElementById('cart-drawer')) return;

    var overlayEl = document.createElement('div');
    overlayEl.id = 'cart-overlay';
    overlayEl.className = 'cart-overlay';
    document.body.appendChild(overlayEl);

    var drawerEl = document.createElement('div');
    drawerEl.id = 'cart-drawer';
    drawerEl.className = 'cart-drawer';
    drawerEl.innerHTML =
      '<div class="cart-drawer-header">'
      +'<h2>Tu carrito</h2>'
      +'<button id="cart-close"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg></button>'
      +'</div>'
      +'<div class="cart-drawer-body" id="cart-drawer-body"></div>'
      +'<div class="cart-drawer-footer" id="cart-drawer-footer"></div>';
    document.body.appendChild(drawerEl);

    document.getElementById('cart-close').addEventListener('click', closeCartDrawer);
    overlayEl.addEventListener('click', closeCartDrawer);
  }

  function openCartDrawer(){
    buildCartDrawer();
    document.getElementById('cart-drawer').classList.add('open');
    document.getElementById('cart-overlay').classList.add('open');
    refreshCartDrawer();
  }

  function closeCartDrawer(){
    var d = document.getElementById('cart-drawer');
    var o = document.getElementById('cart-overlay');
    if(d) d.classList.remove('open');
    if(o) o.classList.remove('open');
  }

  function refreshCartDrawer(){
    fetchCart().then(function(cart){
      updateCartBadge(cart);
      var body = document.getElementById('cart-drawer-body');
      var footer = document.getElementById('cart-drawer-footer');
      if(!body || !footer) return;

      if(!cart || cart.totalQuantity === 0){
        body.innerHTML = '<div style="padding:60px 20px;text-align:center;color:#6b6e5c;font-size:14px">Tu carrito está vacío</div>';
        footer.innerHTML = '';
        return;
      }

      var lines = cart.lines.edges.map(function(e){ return e.node; });
      body.innerHTML = lines.map(function(line){
        var v = line.merchandise;
        var img = v.product.images.edges[0];
        var imgUrl = img ? img.node.url+'&width=120' : '';
        var price = formatPrice(v.price);
        return '<div class="cart-item" data-line-id="'+line.id+'">'
          +'<div class="cart-item-img">'+(imgUrl ? '<img src="'+imgUrl+'" alt="">' : '')+'</div>'
          +'<div class="cart-item-info">'
          +'<div class="cart-item-title">'+v.product.title+'</div>'
          +(v.title !== 'Default Title' ? '<div class="cart-item-variant">'+v.title+'</div>' : '')
          +'<div class="cart-item-price">'+price+'</div>'
          +'<div class="cart-item-qty">'
          +'<button class="cart-qty-btn" data-action="minus">−</button>'
          +'<span>'+line.quantity+'</span>'
          +'<button class="cart-qty-btn" data-action="plus">+</button>'
          +'<button class="cart-remove" data-action="remove"><svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg></button>'
          +'</div>'
          +'</div>'
          +'</div>';
      }).join('');

      var total = formatPrice(cart.cost.totalAmount);
      footer.innerHTML =
        '<div class="cart-total"><span>Total</span><span>'+total+'</span></div>'
        +'<a href="'+cart.checkoutUrl+'" class="cart-checkout-btn">Ir a pagar</a>';

      body.querySelectorAll('.cart-qty-btn, .cart-remove').forEach(function(btn){
        btn.addEventListener('click', function(){
          var item = btn.closest('.cart-item');
          var lineId = item.dataset.lineId;
          var action = btn.dataset.action;
          var qtySpan = item.querySelector('.cart-item-qty span');
          var currentQty = parseInt(qtySpan.textContent);

          if(action === 'minus' && currentQty > 1){
            updateCartLine(lineId, currentQty - 1).then(function(){ refreshCartDrawer(); });
          } else if(action === 'minus' && currentQty <= 1){
            removeCartLine(lineId).then(function(cart){
              updateCartBadge(cart);
              refreshCartDrawer();
            });
          } else if(action === 'plus'){
            updateCartLine(lineId, currentQty + 1).then(function(){ refreshCartDrawer(); });
          } else if(action === 'remove'){
            removeCartLine(lineId).then(function(cart){
              updateCartBadge(cart);
              refreshCartDrawer();
            });
          }
        });
      });
    });
  }

  /* ── INJECT CART DRAWER CSS ── */
  var style = document.createElement('style');
  style.textContent =
    '.cart-overlay{position:fixed;inset:0;background:rgba(42,44,32,0.4);z-index:998;opacity:0;pointer-events:none;transition:opacity .3s}'
    +'.cart-overlay.open{opacity:1;pointer-events:auto}'
    +'.cart-drawer{position:fixed;top:0;right:0;bottom:0;width:420px;max-width:90vw;background:#fbf9f4;z-index:999;transform:translateX(100%);transition:transform .3s;display:flex;flex-direction:column;box-shadow:-10px 0 40px rgba(42,44,32,0.15)}'
    +'.cart-drawer.open{transform:translateX(0)}'
    +'.cart-drawer-header{padding:24px 28px;border-bottom:1px solid rgba(49,53,34,0.12);display:flex;justify-content:space-between;align-items:center}'
    +'.cart-drawer-header h2{font-family:"Cormorant Garamond",serif;font-size:24px;font-weight:400;color:#313522}'
    +'.cart-drawer-header button{background:none;border:none;cursor:pointer;color:#313522;padding:4px}'
    +'.cart-drawer-body{flex:1;overflow-y:auto;padding:20px 28px}'
    +'.cart-item{display:flex;gap:16px;padding:20px 0;border-bottom:1px solid rgba(49,53,34,0.08)}'
    +'.cart-item-img{width:80px;height:80px;border-radius:2px;overflow:hidden;background:#ede5d3;flex-shrink:0}'
    +'.cart-item-img img{width:100%;height:100%;object-fit:cover}'
    +'.cart-item-info{flex:1;display:flex;flex-direction:column;gap:4px}'
    +'.cart-item-title{font-size:14px;font-weight:600;color:#313522}'
    +'.cart-item-variant{font-size:11px;color:#6b6e5c;text-transform:uppercase;letter-spacing:.1em}'
    +'.cart-item-price{font-family:"Cormorant Garamond",serif;font-size:18px;color:#8e421e}'
    +'.cart-item-qty{display:flex;align-items:center;gap:10px;margin-top:6px}'
    +'.cart-qty-btn{width:28px;height:28px;border:1px solid rgba(49,53,34,0.12);background:transparent;cursor:pointer;font-size:14px;color:#313522;display:flex;align-items:center;justify-content:center;border-radius:2px}'
    +'.cart-qty-btn:hover{background:#e8ebe1}'
    +'.cart-item-qty span{font-size:14px;font-weight:600;min-width:20px;text-align:center}'
    +'.cart-remove{margin-left:auto;background:none;border:none;cursor:pointer;color:#6b6e5c;padding:4px}'
    +'.cart-remove:hover{color:#8e421e}'
    +'.cart-drawer-footer{padding:24px 28px;border-top:1px solid rgba(49,53,34,0.12)}'
    +'.cart-total{display:flex;justify-content:space-between;font-size:14px;font-weight:600;color:#313522;margin-bottom:18px}'
    +'.cart-total span:last-child{font-family:"Cormorant Garamond",serif;font-size:22px;color:#8e421e}'
    +'.cart-checkout-btn{display:block;width:100%;background:#313522;color:#f5f1e8;border:none;padding:18px;text-align:center;font-family:"Manrope",sans-serif;font-size:12px;letter-spacing:.18em;text-transform:uppercase;font-weight:500;cursor:pointer;border-radius:2px;text-decoration:none;transition:background .3s}'
    +'.cart-checkout-btn:hover{background:#1a1c12}'
    +'.product-fav.wished svg{fill:#8e421e;stroke:#8e421e}'
    +'.btn-fav.wished svg{fill:#8e421e;stroke:#8e421e}';
  document.head.appendChild(style);

  /* ── INIT ── */
  function init(){
    fetchCart().then(function(cart){ updateCartBadge(cart); });

    document.querySelectorAll('.nav-icon').forEach(function(icon){
      var svg = icon.querySelector('svg');
      if(!svg) return;
      var paths = svg.innerHTML;
      if(paths.indexOf('6 2 3 6') !== -1 || paths.indexOf('M6 2') !== -1){
        icon.style.cursor = 'pointer';
        icon.addEventListener('click', function(e){
          e.preventDefault();
          openCartDrawer();
        });
      }
    });
  }

  if(document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
  else init();

  /* ── PUBLIC API ── */
  window.BotanicCart = {
    addToCart: function(variantId, qty){
      return addToCart(variantId, qty).then(function(cart){
        updateCartBadge(cart);
        openCartDrawer();
        return cart;
      });
    },
    openCartDrawer: openCartDrawer,
    fetchCart: fetchCart,
    updateCartBadge: updateCartBadge,
    isWished: isWished,
    toggleWish: toggleWish,
    formatPrice: formatPrice
  };
})();
