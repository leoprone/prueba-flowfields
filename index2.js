//  Detección del tamaño de pantalla

function getDeviceSettings() {
  const width = window.innerWidth;

  if (width < 768) {
    // Pantallas pequeñas (móviles)
    return {
      numberOfParticles: 15,
      baseSize: 10,
      highlightSize: 24,
      mouseRadius: 100
    };
  } else if (width < 1200) {
    // Pantallas medianas (tablets o laptops)
    return {
      numberOfParticles: 15,
      baseSize: 20,
      highlightSize: 30,
      mouseRadius: 150
    };
  } else {
    // Pantallas grandes (desktops)
    return {
      numberOfParticles: 45,
      baseSize: 15,
      highlightSize: 20,
      mouseRadius: 200
    };
  }
}






const canvas = document.getElementById('canvas1');
const ctx = canvas.getContext('2d');
canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

const gradient = ctx.createLinearGradient(0, 0, canvas.width, canvas.height);
gradient.addColorStop(0, 'white');
gradient.addColorStop(0.5, 'gold');
gradient.addColorStop(1, 'orangered');
ctx.fillStyle = gradient;
ctx.strokeStyle = 'white';

class Particle {
  
          constructor(effect) {
                this.effect = effect;
                this.radius = Math.floor(Math.random() * 10 + 10);
                this.x = this.radius + Math.random() * (this.effect.width - this.radius * 2);
                this.y = this.radius + Math.random() * (this.effect.height - this.radius * 2);
                this.vx = Math.random() * 1 - 0.1;
                this.vy = Math.random() * 1 - 0.1;
                this.pushX = 0;
                this.pushY = 0;
                this.friction = 0.95;
                this.highlight = false;
                this.highlightTimer = 0;
                this.color = 'gray';

                const letters = ['H', 'u', 'b'];
                this.char = letters[Math.floor(Math.random() * letters.length)];
            }

            draw(context) {
                context.fillStyle = this.color;
                context.font = `${this.currentSize * 6}px Arial`;
                context.fillText(this.char, this.x, this.y);
            }

    update() {
        
        const dx = this.x - this.effect.mouse.x;
        const dy = this.y - this.effect.mouse.y;
        const distance = Math.hypot(dx, dy);
        
        const force = (this.effect.mouse.radius * .6) / distance; // más sensible

        if (this.highlight) {
            
            this.highlightTimer--;
            if (this.highlightTimer <= 0) {
                this.highlight = false;

            }
        }


        // Suavizar transición de tamaño
        const lerpFactor = 0.05;
        this.currentSize += (this.targetSize - this.currentSize) * lerpFactor;

        if (this.highlight) {
            this.highlightTimer--;
            if (this.highlightTimer <= 0) {
                this.highlight = false;
                this.targetSize = this.baseSize;
                this.color ='gray'; // restaurar color original
            }
        }




        if (distance < this.effect.mouse.radius) {
            const angle = Math.atan2(dy, dx);
            this.pushX += Math.cos(angle) * force;
            this.pushY += Math.sin(angle) * force;
        }

        this.x += (this.pushX *= this.friction) + this.vx;
        this.y += (this.pushY *= this.friction) + this.vy;

        // rebote en bordes
        if (this.x < this.radius) {
            this.x = this.radius;
            this.vx *= -1;
        } else if (this.x > this.effect.width - this.radius) {
            this.x = this.effect.width - this.radius;
            this.vx *= -1;
        }

        if (this.y < this.radius) {
            this.y = this.radius;
            this.vy *= -1;
        } else if (this.y > this.effect.height - this.radius) {
            this.y = this.effect.height - this.radius;
            this.vy *= -1;
        }
    }

    reset() {
        this.x = this.radius + Math.random() * (this.effect.width - this.radius * 2);
        this.y = this.radius + Math.random() * (this.effect.height - this.radius * 2);
    }
}

class Effect {
    constructor(canvas, context) {
            this.canvas = canvas;
            this.context = context;
            this.width = this.canvas.width;
            this.height = this.canvas.height;
            this.particles = [];

            const settings = getDeviceSettings();
            this.numberOfParticles = settings.numberOfParticles;
            this.baseSize = settings.baseSize;
            this.highlightSize = settings.highlightSize;

            this.mouse = {
            x: 0,
            y: 0,
            radius: settings.mouseRadius
            };

            this.createParticles();

            window.addEventListener('resize', e => {
            this.resize(e.target.innerWidth, e.target.innerHeight);
            });

            window.addEventListener('mousemove', e => {
            this.mouse.x = e.clientX;
            this.mouse.y = e.clientY;
            });

            window.addEventListener('touchmove', e => {
            if (e.touches.length > 0) {
                this.mouse.x = e.touches[0].clientX;
                this.mouse.y = e.touches[0].clientY;
            }
            });
        }

        createParticles() {
            for (let i = 0; i < this.numberOfParticles; i++) {
            const particle = new Particle(this);
            particle.baseSize = this.baseSize;
            particle.highlightSize = this.highlightSize;
            particle.currentSize = this.baseSize;
            particle.targetSize = this.baseSize;
            this.particles.push(particle);
            }
        }
    handleParticles(context) {
        this.connectParticles(context);
        this.particles.forEach(particle => {
            particle.draw(context);
            particle.update();
        });
    }


connectParticles(context) {
    const maxDistance = 150;

    for (let i = 0; i < this.particles.length; i++) {
        const p1 = this.particles[i];
        if (p1.char !== 'H') continue;

        for (let j = 0; j < this.particles.length; j++) {
            const p2 = this.particles[j];
            if (p2.char !== 'u') continue;

            const d1 = Math.hypot(p1.x - p2.x, p1.y - p2.y);
            if (d1 > maxDistance) continue;

            for (let k = 0; k < this.particles.length; k++) {
                const p3 = this.particles[k];
                if (p3.char !== 'b') continue;

                const d2 = Math.hypot(p2.x - p3.x, p2.y - p3.y);
                if (d2 > maxDistance) continue;

                // Activar highlight
             
                p1.highlight = true;
                p2.highlight = true;
                p3.highlight = true;

                p1.highlightTimer = 30;
                p2.highlightTimer = 30;
                p3.highlightTimer = 30;

                p1.targetSize = p1.highlightSize;
                p2.targetSize = p2.highlightSize;
                p3.targetSize = p3.highlightSize;

                // Cambiar color
                const matchColor = '#FEFEFE';
                p1.color = matchColor;
                p2.color = matchColor;
                p3.color = matchColor;


                // Dibuja la conexión
                context.save();
                context.globalAlpha = 1;
                context.strokeStyle = '#130F8A';
                context.lineWidth = 15;
                context.beginPath();
                context.moveTo(p1.x, p1.y);
                context.lineTo(p2.x, p2.y);
                context.lineTo(p3.x, p3.y);
                context.stroke();
                context.restore();
            }
        }
    }
}


    resize(width, height) {
        this.canvas.width = width;
        this.canvas.height = height;
        this.width = width;
        this.height = height;
        const gradient = this.context.createLinearGradient(0, 0, width, height);
        gradient.addColorStop(0, 'white');
        gradient.addColorStop(0.5, 'gold');
        gradient.addColorStop(1, 'orangered');
        this.context.fillStyle = gradient;
        this.context.strokeStyle = 'gray';
        this.particles.forEach(particle => {
            particle.reset();
        });
    }
}

const effect = new Effect(canvas, ctx);

function animate() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    effect.handleParticles(ctx);
    requestAnimationFrame(animate);
}
animate();
