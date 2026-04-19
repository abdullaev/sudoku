interface Particle {
  x: number; y: number;
  vx: number; vy: number;
  alpha: number;
  color: string;
  radius: number;
}

const COLORS = ['#ff4757', '#ffa502', '#2ed573', '#1e90ff', '#ff6b81', '#eccc68', '#a29bfe', '#fd79a8'];

function burst(particles: Particle[]): void {
  const x = window.innerWidth  * (0.2 + Math.random() * 0.6);
  const y = window.innerHeight * (0.15 + Math.random() * 0.4);
  const color = COLORS[Math.floor(Math.random() * COLORS.length)];
  const count = 45 + Math.floor(Math.random() * 20);

  for (let i = 0; i < count; i++) {
    const angle = (i / count) * Math.PI * 2;
    const speed = 2 + Math.random() * 4;
    particles.push({
      x, y,
      vx: Math.cos(angle) * speed,
      vy: Math.sin(angle) * speed,
      alpha: 1,
      color,
      radius: 2 + Math.random() * 2,
    });
  }
}

export function startFireworks(): void {
  const canvas = document.createElement('canvas');
  canvas.style.cssText = 'position:fixed;inset:0;pointer-events:none;z-index:9999';
  canvas.width  = window.innerWidth;
  canvas.height = window.innerHeight;
  document.body.appendChild(canvas);

  const ctx = canvas.getContext('2d')!;
  const particles: Particle[] = [];
  let burstsFired = 0;
  const totalBursts = 7;

  function fireBurst() {
    burst(particles);
    burstsFired++;
    if (burstsFired < totalBursts) {
      setTimeout(fireBurst, 400 + Math.random() * 300);
    }
  }
  fireBurst();

  function tick() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    for (let i = particles.length - 1; i >= 0; i--) {
      const p = particles[i];
      p.x  += p.vx;
      p.y  += p.vy;
      p.vy += 0.07;
      p.vx *= 0.99;
      p.alpha -= 0.013;

      if (p.alpha <= 0) { particles.splice(i, 1); continue; }

      ctx.globalAlpha = p.alpha;
      ctx.fillStyle   = p.color;
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
      ctx.fill();
    }

    ctx.globalAlpha = 1;

    if (particles.length > 0 || burstsFired < totalBursts) {
      requestAnimationFrame(tick);
    } else {
      canvas.remove();
    }
  }

  requestAnimationFrame(tick);
}
