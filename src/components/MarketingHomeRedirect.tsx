export function MarketingHomeRedirect() {
  return (
    <div style={{
      fontFamily: "'Manrope', sans-serif",
      background: '#fbf9f4',
      color: '#2a2c20',
      overflow: 'hidden',
      height: '100vh',
      display: 'flex',
      flexDirection: 'column',
      WebkitFontSmoothing: 'antialiased',
      margin: 0,
      padding: 0,
    }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,300;0,400;0,500;0,600;1,300;1,400&family=Manrope:wght@300;400;500;600;700&display=swap');
        .cs-bg-layer{position:fixed;inset:0;pointer-events:none;z-index:0;overflow:hidden}
        .cs-circle{position:absolute;border-radius:50%;opacity:0.35}
        .cs-c1{width:600px;height:600px;background:radial-gradient(circle,#e8ebe1 0%,transparent 70%);top:-180px;right:-120px;animation:csf1 20s ease-in-out infinite}
        .cs-c2{width:500px;height:500px;background:radial-gradient(circle,#ede5d3 0%,transparent 70%);bottom:-200px;left:-100px;animation:csf2 24s ease-in-out infinite}
        .cs-c3{width:350px;height:350px;background:radial-gradient(circle,rgba(185,160,53,0.15) 0%,transparent 70%);top:50%;left:50%;transform:translate(-50%,-50%);animation:csf3 18s ease-in-out infinite}
        @keyframes csf1{0%,100%{transform:translate(0,0)}50%{transform:translate(-40px,30px)}}
        @keyframes csf2{0%,100%{transform:translate(0,0)}50%{transform:translate(30px,-40px)}}
        @keyframes csf3{0%,100%{transform:translate(-50%,-50%) scale(1)}50%{transform:translate(-50%,-50%) scale(1.15)}}
        .cs-main{position:relative;z-index:1;flex:1;display:flex;flex-direction:column;align-items:center;justify-content:center;padding:40px;text-align:center;gap:48px}
        .cs-logo{text-align:center;line-height:1;font-family:'Cormorant Garamond',serif;opacity:0;animation:csfup 1s ease forwards 0.2s}
        .cs-logo .cs-mark{width:44px;height:44px;color:#313522;margin:0 auto 10px;display:block}
        .cs-logo .cs-name{font-size:clamp(28px,4vw,42px);letter-spacing:0.18em;color:#313522;font-weight:500}
        .cs-logo .cs-care{font-style:italic;font-size:clamp(20px,2.8vw,30px);color:#7d8768;display:inline;margin-left:0.35em;vertical-align:baseline}
        .cs-text{font-family:'Manrope',sans-serif;font-size:clamp(12px,1.4vw,15px);font-weight:500;letter-spacing:0.35em;text-transform:uppercase;color:#6b6e5c;opacity:0;animation:csfup 1s ease forwards 0.6s}
        .cs-footer{position:relative;z-index:1;text-align:center;padding:24px 40px;font-size:11px;color:#6b6e5c;letter-spacing:0.08em;opacity:0.6}
        @keyframes csfup{from{opacity:0;transform:translateY(24px)}to{opacity:1;transform:translateY(0)}}
      `}</style>

      <div className="cs-bg-layer">
        <div className="cs-circle cs-c1" />
        <div className="cs-circle cs-c2" />
        <div className="cs-circle cs-c3" />
      </div>

      <main className="cs-main">
        <div className="cs-logo">
          <svg className="cs-mark" viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
            <g fill="currentColor">
              <ellipse cx="50" cy="22" rx="6" ry="14"/>
              <ellipse cx="34" cy="34" rx="5.5" ry="13" transform="rotate(-45 34 34)"/>
              <ellipse cx="66" cy="34" rx="5.5" ry="13" transform="rotate(45 66 34)"/>
              <ellipse cx="34" cy="62" rx="5.5" ry="13" transform="rotate(45 34 62)"/>
              <ellipse cx="66" cy="62" rx="5.5" ry="13" transform="rotate(-45 66 62)"/>
              <ellipse cx="50" cy="76" rx="6" ry="16"/>
              <circle cx="20" cy="48" r="3"/>
              <circle cx="80" cy="48" r="3"/>
            </g>
          </svg>
          <span className="cs-name">BOTANIC</span>
          <span className="cs-care">care</span>
        </div>
        <p className="cs-text">Coming Soon</p>
      </main>

      <footer className="cs-footer">
        &copy; 2026 Botanic Care — Todos los derechos reservados
      </footer>
    </div>
  );
}
