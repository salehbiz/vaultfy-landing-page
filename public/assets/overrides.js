    if (history.scrollRestoration) {
      history.scrollRestoration = 'manual';
    }
    window.scrollTo(0, 0);
    window.addEventListener('beforeunload', () => {
      window.scrollTo(0, 0);
    });
    window.addEventListener('load', () => {
      setTimeout(() => {
        window.scrollTo(0, 0);
        if (window.__lenis) {
          window.__lenis.scrollTo(0, { immediate: true });
        }
      }, 0);
    });

    window.currentTheme = "day";
    let heroTrigger = null;
    
    // Night frame ranges configuration (1-indexed frame numbers matching webp filenames)
    window.nightRangesDesktop = {
      residences: { start: 20, end: 30 },
      horology: { start: 30, end: 54 },
      events: { start: 54, end: 87 },
      automotive: { start: 87, end: 118 },
      yachts: { start: 118, end: 156 },
      aviation: { start: 156, end: 190 }
    };

    window.nightRangesMobile = {
      residences: { start: 12, end: 18 },
      horology: { start: 18, end: 33 },
      events: { start: 33, end: 52 },
      automotive: { start: 52, end: 71 },
      yachts: { start: 71, end: 93 },
      aviation: { start: 93, end: 114 }
    };

    window.updateHeroRanges = function() {
      if (!window.activeConfig || !window.Bc || !window.ds) return;
      
      const isMobile = !window.matchMedia("(min-width: 1024px)").matches;
      const totalFrames = window.activeConfig.frameCount;
      const isNight = window.currentTheme === 'night';
      
      let newBc, newDs;
      if (isNight) {
        const ranges = isMobile ? window.nightRangesMobile : window.nightRangesDesktop;
        const denom = isMobile ? 240 : 243;
        newBc = [
          { sel: "#chapter-residences", in: (ranges.residences.start - 1) / denom, out: (ranges.residences.end - 1) / denom },
          { sel: "#chapter-horology", in: (ranges.horology.start - 1) / denom, out: (ranges.horology.end - 1) / denom },
          { sel: "#chapter-events", in: (ranges.events.start - 1) / denom, out: (ranges.events.end - 1) / denom },
          { sel: "#chapter-automotive", in: (ranges.automotive.start - 1) / denom, out: (ranges.automotive.end - 1) / denom },
          { sel: "#chapter-yachts", in: (ranges.yachts.start - 1) / denom, out: (ranges.yachts.end - 1) / denom },
          { sel: "#chapter-aviation", in: (ranges.aviation.start - 1) / denom, out: 0.95 }
        ];
        newDs = [
          { until: (ranges.residences.start - 1) / denom, label: "I · Sky" },
          { until: (ranges.residences.end - 1) / denom, label: "II · Residences" },
          { until: (ranges.horology.end - 1) / denom, label: "III · Horology" },
          { until: (ranges.events.end - 1) / denom, label: "IV · Private Events" },
          { until: (ranges.automotive.end - 1) / denom, label: "V · Automotive" },
          { until: (ranges.yachts.end - 1) / denom, label: "VI · Yachts" },
          { until: 1/0, label: "VII · Aviation" }
        ];
      } else {
        // Day (original constants divided by 4)
        if (isMobile) {
          newBc = [
            { sel: "#chapter-residences", in: 12/120, out: 18/120 },
            { sel: "#chapter-horology", in: 18/120, out: 33/120 },
            { sel: "#chapter-events", in: 33/120, out: 52/120 },
            { sel: "#chapter-automotive", in: 52/120, out: 71/120 },
            { sel: "#chapter-yachts", in: 71/120, out: 93/120 },
            { sel: "#chapter-aviation", in: 93/120, out: 0.95 }
          ];
          newDs = [
            { until: 12/120, label: "I · Sky" },
            { until: 18/120, label: "II · Residences" },
            { until: 33/120, label: "III · Horology" },
            { until: 52/120, label: "IV · Private Events" },
            { until: 71/120, label: "V · Automotive" },
            { until: 93/120, label: "VI · Yachts" },
            { until: 1/0, label: "VII · Aviation" }
          ];
        } else {
          newBc = [
            { sel: "#chapter-residences", in: 20/200, out: 30/200 },
            { sel: "#chapter-horology", in: 30/200, out: 54/200 },
            { sel: "#chapter-events", in: 54/200, out: 87/200 },
            { sel: "#chapter-automotive", in: 87/200, out: 118/200 },
            { sel: "#chapter-yachts", in: 118/200, out: 156/200 },
            { sel: "#chapter-aviation", in: 156/200, out: 0.95 }
          ];
          newDs = [
            { until: 20/200, label: "I · Sky" },
            { until: 30/200, label: "II · Residences" },
            { until: 54/200, label: "III · Horology" },
            { until: 87/200, label: "IV · Private Events" },
            { until: 118/200, label: "V · Automotive" },
            { until: 156/200, label: "VI · Yachts" },
            { until: 1/0, label: "VII · Aviation" }
          ];
        }
      }
      
      // Update variables exposed by the JS bundle
      window.Bc.length = 0;
      newBc.forEach(item => window.Bc.push(item));
      
      window.ds.length = 0;
      newDs.forEach(item => window.ds.push(item));
      
      // Rebuild timeline!
      if (window.heroTimeline && typeof window.Hc === 'function') {
        // Kill the old trigger & timeline
        if (window.heroTimeline.scrollTrigger) {
          window.heroTimeline.scrollTrigger.kill(true);
        }
        window.heroTimeline.kill();
        
        // Re-create the timeline
        const eyebrowLetters = Array.from(document.querySelectorAll("#zone-eyebrow .eyebrow span"));
        window.Hc(window.activePlayer, { pinPxPerFrame: 4, eyebrowLetters: eyebrowLetters });

        // Re-initialize services animation on the new timeline!
        if (typeof window.initServicesAnimation === 'function') {
          window.initServicesAnimation();
        }
      }
    };

    // Check when hero timeline is loaded to sync initial theme configs
    document.addEventListener('DOMContentLoaded', () => {
      const checkInit = setInterval(() => {
        if (window.heroTimeline && window.Bc && window.ds && window.Hc) {
          clearInterval(checkInit);
          window.updateHeroRanges();
        }
      }, 100);
    });

    function fadeLoader() {
      const loader = document.getElementById('loader');
      if (loader) {
        if (window.gsap) {
          window.gsap.to(loader, {
            opacity: 0,
            duration: 0.5,
            onComplete: () => {
              loader.style.display = 'none';
              if (window.__lenis) window.__lenis.start();
              if (window.ScrollTrigger) {
                window.ScrollTrigger.sort();
                window.ScrollTrigger.refresh();
              }
            }
          });
        } else {
          loader.style.transition = 'opacity 0.5s ease-in-out';
          loader.style.opacity = '0';
          setTimeout(() => {
            loader.style.display = 'none';
            if (window.__lenis) window.__lenis.start();
            if (window.ScrollTrigger) {
              window.ScrollTrigger.sort();
              window.ScrollTrigger.refresh();
            }
          }, 500);
        }
      }
    }

    async function switchTheme(newTheme) {
      if (window.currentTheme === newTheme) return;
      if (newTheme === 'night') return;
      
      const toggleContainer = document.getElementById('theme-toggle-container');
      if (toggleContainer) {
        toggleContainer.classList.remove('day', 'night');
        toggleContainer.classList.add(newTheme);
      }
      
      window.currentTheme = newTheme;
      if (window.particlesBg) {
        const brandGold = getComputedStyle(document.documentElement).getPropertyValue('--color-accent').trim() || '#ead9b8';
        const whiteHover = getComputedStyle(document.documentElement).getPropertyValue('--color-accent-hover').trim() || '#ffffff';
        window.particlesBg.updateColor(newTheme === 'day' ? brandGold : whiteHover);
      }
      
      // Stop Lenis scrolling
      if (window.__lenis) {
        window.__lenis.stop();
      }
      
      // Show Loader
      const loader = document.getElementById('loader');
      const loaderFill = document.getElementById('loader-fill');
      const loaderPct = document.getElementById('loader-pct');
      if (loader) {
        loader.style.display = 'flex';
        loader.style.opacity = '1';
        if (loaderFill) loaderFill.style.right = '100%';
        if (loaderPct) loaderPct.textContent = '0%';
      }
      
      const canvas = document.getElementById('hero-canvas');
      const video = document.getElementById('hero-video-night');
      
      if (video) {
        video.style.display = 'none';
        video.pause();
      }
      if (canvas) {
        canvas.style.display = 'block';
      }
      
      if (window.activePlayer) {
        window.activePlayer.clearCache();
        try {
          // Get current frame index matching scroll progress
          if (!heroTrigger && window.ScrollTrigger) {
            const heroEl = document.getElementById('hero');
            heroTrigger = window.ScrollTrigger.getAll().find(t => t.trigger === heroEl);
          }
          const currentFrame = heroTrigger 
            ? Math.round(heroTrigger.progress * (window.activeConfig.frameCount - 1))
            : (typeof window.activePlayer.getCurrentFrame === 'function' ? window.activePlayer.getCurrentFrame() : 0);
          
          const targetFrame = Math.max(0, Math.min(window.activeConfig.frameCount - 1, currentFrame));
          
          // Preload the current frame immediately
          await window.activePlayer.preloadOne(targetFrame);
          
          // Preload surrounding frames for buffer
          const sidePromises = [];
          for (let offset = 1; offset <= 3; offset++) {
            if (targetFrame + offset < window.activeConfig.frameCount) {
              sidePromises.push(window.activePlayer.preloadOne(targetFrame + offset));
            }
            if (targetFrame - offset >= 0) {
              sidePromises.push(window.activePlayer.preloadOne(targetFrame - offset));
            }
          }
          await Promise.all(sidePromises);
          
          // Draw correct frame immediately
          window.activePlayer.draw(targetFrame);
          
          // Preload the rest in the background
          window.activePlayer.preloadAll((loaded, total) => {
            const pct = Math.round((loaded / total) * 100);
            if (loaderPct) loaderPct.textContent = `${pct}%`;
            if (loaderFill) loaderFill.style.right = `${100 - pct}%`;
          }, 90);
          
          if (window.ScrollTrigger) {
            window.ScrollTrigger.update();
          }
          
          // Rebuild the timeline using current theme ranges
          if (typeof window.updateHeroRanges === 'function') {
            window.updateHeroRanges();
          }
        } catch (e) {
          console.error("Failed to preload theme frames:", e);
        }
      }
      fadeLoader();
    }

    // Debounced window resize event listener for range rebuilding and trigger cleanups
    let resizeTimeout = null;
    window.addEventListener('resize', () => {
      if (resizeTimeout) clearTimeout(resizeTimeout);
      resizeTimeout = setTimeout(() => {
        if (typeof window.updateHeroRanges === 'function') {
          window.updateHeroRanges();
        }
      }, 200);
    });

      // ============ OUR SERVICES ANIMATION ============
      document.addEventListener('DOMContentLoaded', () => {
        // Split words into spans on page load
        const serviceWords = document.querySelectorAll('.service-word');
        serviceWords.forEach((word) => {
          const text = word.textContent.trim();
          word.innerHTML = '';
          text.split('').forEach(char => {
            const span = document.createElement('span');
            span.textContent = char;
            span.className = 'char';
            word.appendChild(span);
          });
        });

        // Initialize elements and variables that persist across timeline rebuilds
        const canvas = document.getElementById('services-canvas');
        if (!canvas) return;
        const ctx = canvas.getContext('2d');
        const servicesSection = document.getElementById('our-services-section');

        const frameCount = 192;
        const currentFrame = index => {
          const isMobile = window.matchMedia("(max-width: 1023px)").matches;
          const folder = isMobile ? "assets/hero-frames-mobile" : "assets/hero-frames";
          const frameNum = index + 801;
          return `https://vaultfy-one.vercel.app/${folder}/frame_${String(frameNum).padStart(4, '0')}.webp`;
        };

        const air = {
          frame: 0
        };
        window.servicesAir = air;

        // Optimized Cache System for Services Canvas (Sliding Window of 24 frames max)
        const serviceImageCache = new Map();
        const maxServiceCacheSize = 24;

        function getServiceImage(index) {
          if (serviceImageCache.has(index)) {
            return serviceImageCache.get(index);
          }
          const img = new Image();
          img.src = currentFrame(index);
          
          if (serviceImageCache.size >= maxServiceCacheSize) {
            const oldestKey = serviceImageCache.keys().next().value;
            serviceImageCache.delete(oldestKey);
          }
          serviceImageCache.set(index, img);
          return img;
        }

        let prefetchTimeoutId = null;

        // Sequential background pre-downloading to browser HTTP cache (keeps memory clear)
        function prefetchServices() {
          if (prefetchTimeoutId) clearTimeout(prefetchTimeoutId);
          let i = 0;
          function next() {
            if (i >= frameCount) return;
            const img = new Image();
            img.src = currentFrame(i);
            img.onload = img.onerror = () => {
              i++;
              prefetchTimeoutId = setTimeout(next, 15);
            };
          }
          prefetchTimeoutId = setTimeout(next, 2500);
        }
        prefetchServices();

        // Load first frame
        const firstImg = getServiceImage(0);
        firstImg.onload = () => {
          render();
        };

        function resizeCanvas() {
          canvas.width = window.innerWidth;
          canvas.height = window.innerHeight;
          render();
        }
        window.addEventListener('resize', resizeCanvas);
        resizeCanvas();

        function render() {
          const activeImg = getServiceImage(air.frame);
          if (!activeImg) return;

          if (!activeImg.complete) {
            activeImg.onload = () => {
              if (getServiceImage(air.frame) === activeImg) {
                draw(activeImg);
              }
            };
            return;
          }
          draw(activeImg);
        }

        function draw(activeImg) {
          const canvasRatio = canvas.width / canvas.height;
          const imgRatio = activeImg.width / activeImg.height;

          let drawWidth, drawHeight, drawX, drawY;
          if (canvasRatio > imgRatio) {
            drawWidth = canvas.width;
            drawHeight = canvas.width / imgRatio;
            drawX = 0;
            drawY = (canvas.height - drawHeight) / 2;
          } else {
            drawWidth = canvas.height * imgRatio;
            drawHeight = canvas.height;
            drawX = (canvas.width - drawWidth) / 2;
            drawY = 0;
          }

          ctx.clearRect(0, 0, canvas.width, canvas.height);
          ctx.drawImage(activeImg, drawX, drawY, drawWidth, drawHeight);
        }

        // Global function to attach services animations to the current window.heroTimeline
        window.initServicesAnimation = function() {
          // Clear service image cache to load new theme/responsive files
          serviceImageCache.clear();

          // Restart prefetching for the current theme frames
          prefetchServices();

          // Reset animation frame
          air.frame = 0;

          // Trigger progress representing frame 714 of 799 on desktop or 428 of 480 on mobile
          const isMobile = window.matchMedia("(max-width: 1023px)").matches;
          const startProgress = isMobile ? 428 / 479 : 714 / 799;
          const progressDuration = 1.0 - startProgress;

          // Hook into the main hero timeline exposed by the JS bundle
          const tl = window.heroTimeline;
          if (!tl) return;

          // Initialize hidden state
          tl.set(servicesSection, { opacity: 0, visibility: 'hidden' }, 0);
          tl.set('.hero-bottom-blend', { opacity: 0 }, 0);

          // Fade in services section at progress corresponding to frame 714
          tl.to(servicesSection, {
            opacity: 1,
            visibility: 'visible',
            duration: 0.005,
            onStart: () => {
              servicesSection.classList.add('active');
            },
            onReverseComplete: () => {
              servicesSection.classList.remove('active');
            }
          }, startProgress);

          // Fade in the hero bottom blend during the last section
          tl.to('.hero-bottom-blend', {
            opacity: 1,
            duration: progressDuration * 0.2,
            ease: 'power2.out'
          }, startProgress);

          // Animate frame scrubbing with render callback
          tl.to(air, {
            frame: frameCount - 1,
            snap: 'frame',
            ease: 'none',
            duration: progressDuration,
            onUpdate: render
          }, startProgress);

          // Animate text reveal and active classes
          serviceWords.forEach((word, idx) => {
            // Create convergence ("crashing") offset: outer words start further away, inner words closer
            const initialY = (idx - 1.5) * 160;
            window.gsap.set(word, { y: initialY, opacity: 0 });

            // Step 1: Slide into center and fade in as outlined text
            tl.to(word, {
              opacity: 0.35,
              y: 0,
              duration: 0.18 * progressDuration,
              ease: "power2.out"
            }, startProgress + (0.05 + idx * 0.18) * progressDuration);

            // Step 2: "Light up" to solid gold
            tl.to(word, {
              color: '#ead9b8',
              webkitTextStroke: '1px rgba(234, 217, 184, 0)',
              textShadow: '0 0 40px rgba(234, 217, 184, 0.2)',
              opacity: 1,
              duration: 0.15 * progressDuration,
              ease: "power1.inOut"
            }, startProgress + (0.15 + idx * 0.18) * progressDuration);

            // Step 3: Dim back to outline as we scroll past it
            if (idx < serviceWords.length - 1) {
              tl.to(word, {
                color: 'transparent',
                webkitTextStroke: '1px rgba(234, 217, 184, 0.25)',
                textShadow: '0 0 0px transparent',
                opacity: 0.35,
                duration: 0.15 * progressDuration,
                ease: "power1.inOut"
              }, startProgress + (0.32 + idx * 0.18) * progressDuration);
            }

            // Step 4 (Shatter & Wander): individual letters explode/scatter away
            const chars = word.querySelectorAll('.char');
            chars.forEach((char) => {
              // Calculate random dispersion direction and distance (polar coordinates)
              const angle = Math.random() * Math.PI * 2;
              const distance = 150 + Math.random() * 250; // Random travel distance
              const targetX = Math.cos(angle) * distance;
              const targetY = Math.sin(angle) * distance;
              const targetRot = (Math.random() - 0.5) * 360;

              tl.to(char, {
                x: targetX,
                y: targetY,
                rotation: targetRot,
                opacity: 0,
                duration: 0.15 * progressDuration,
                ease: "power2.inOut"
              }, startProgress + (0.72 + idx * 0.04) * progressDuration);
            });
          });
        };

        const checkGSAP = setInterval(() => {
          if (window.gsap && window.ScrollTrigger && window.heroTimeline) {
            clearInterval(checkGSAP);
            window.initServicesAnimation();
          }
        }, 100);
      });

      // Robust ScrollTrigger offset calibration
      function calibrateScrollTriggers() {
        if (window.ScrollTrigger) {
          window.ScrollTrigger.sort();
          window.ScrollTrigger.refresh();
        }
      }

      // 1. Run on window load
      window.addEventListener('load', calibrateScrollTriggers);

      // 2. Run on first scroll interaction
      const handleFirstScroll = () => {
        calibrateScrollTriggers();
        window.removeEventListener('scroll', handleFirstScroll);
      };
      window.addEventListener('scroll', handleFirstScroll);

      // 3. Run at staggered timeouts to catch slow framework/Lenis initializations
      setTimeout(calibrateScrollTriggers, 1000);
      setTimeout(calibrateScrollTriggers, 2500);

      // ============ ABOUT SECTION CANVAS ANIMATION (3D Diamond & Sparks) ============
      document.addEventListener('DOMContentLoaded', () => {
        const canvas = document.getElementById('about-canvas');
        if (!canvas) return;
        const ctx = canvas.getContext('2d');

        let width = canvas.width = canvas.offsetWidth;
        let height = canvas.height = canvas.offsetHeight;

        function resizeCanvas() {
          if (!canvas) return;
          width = canvas.width = canvas.offsetWidth;
          height = canvas.height = canvas.offsetHeight;
        }
        window.addEventListener('resize', resizeCanvas);

        // 3D Diamond Model Definition
        // Vertices (x, y, z)
        const vertices = [];
        const numRingPoints = 8;
        
        // 1. Top tip
        vertices.push({ x: 0, y: 1.25, z: 0 });
        
        // 2. Upper ring (wide)
        const upperY = 0.35;
        const upperRadius = 0.95;
        for (let i = 0; i < numRingPoints; i++) {
          const angle = (i / numRingPoints) * Math.PI * 2;
          vertices.push({
            x: Math.cos(angle) * upperRadius,
            y: upperY,
            z: Math.sin(angle) * upperRadius
          });
        }

        // 3. Lower ring (medium)
        const lowerY = -0.3;
        const lowerRadius = 0.65;
        for (let i = 0; i < numRingPoints; i++) {
          // Offset the lower ring vertices by half step for diamond triangles
          const angle = ((i + 0.5) / numRingPoints) * Math.PI * 2;
          vertices.push({
            x: Math.cos(angle) * lowerRadius,
            y: lowerY,
            z: Math.sin(angle) * lowerRadius
          });
        }

        // 4. Bottom tip
        vertices.push({ x: 0, y: -1.25, z: 0 });

        // Edges (pairs of vertex indices)
        const edges = [];
        
        // Connect top tip (index 0) to upper ring (indices 1 to 8)
        for (let i = 1; i <= numRingPoints; i++) {
          edges.push({ a: 0, b: i });
        }

        // Connect upper ring in a loop
        for (let i = 1; i <= numRingPoints; i++) {
          const next = i === numRingPoints ? 1 : i + 1;
          edges.push({ a: i, b: next });
        }

        // Connect upper ring to lower ring (indices 9 to 16)
        // Since offset by 0.5, each upper ring point connects to 2 lower ring points to form triangles
        for (let i = 1; i <= numRingPoints; i++) {
          const u1 = i + numRingPoints; // matching lower ring index
          const u2 = i === 1 ? (2 * numRingPoints) : (i - 1 + numRingPoints);
          edges.push({ a: i, b: u1 });
          edges.push({ a: i, b: u2 });
        }

        // Connect lower ring in a loop
        for (let i = 1; i <= numRingPoints; i++) {
          const idx = i + numRingPoints;
          const nextIdx = i === numRingPoints ? (1 + numRingPoints) : (idx + 1);
          edges.push({ a: idx, b: nextIdx });
        }

        // Connect lower ring to bottom tip (index 17)
        const bottomIdx = vertices.length - 1;
        for (let i = 1; i <= numRingPoints; i++) {
          edges.push({ a: i + numRingPoints, b: bottomIdx });
        }

        // Rotation angles
        let angleX = 0.25;
        let angleY = 0.0;
        let targetAngleX = 0.25;
        let targetAngleY = 0.0;

        // Particle sparks
        const particles = [];
        const maxParticles = 45;

        class Spark {
          constructor() {
            this.reset(true);
          }
          reset(init = false) {
            this.x = Math.random() * width;
            this.y = init ? Math.random() * height : height + 20;
            this.size = Math.random() * 2.0 + 0.6;
            this.speedX = Math.random() * 0.8 - 0.4;
            this.speedY = -(Math.random() * 0.8 + 0.3);
            const isOrange = Math.random() > 0.4;
            this.color = isOrange ? 'rgba(234, 180, 100,' : 'rgba(255, 255, 255,';
            this.opacity = Math.random() * 0.4 + 0.15;
            this.life = 0;
            this.maxLife = Math.random() * 300 + 150;
            this.wobbleSpeed = Math.random() * 0.02 + 0.005;
            this.wobbleRange = Math.random() * 1.2;
          }
          update() {
            this.y += this.speedY;
            this.x += this.speedX + Math.sin(this.life * this.wobbleSpeed) * this.wobbleRange * 0.1;
            this.life++;
            
            let currentOpacity = this.opacity * (1 - this.life / this.maxLife);
            if (currentOpacity < 0) currentOpacity = 0;
            this.currentOpacity = currentOpacity;

            if (this.life >= this.maxLife || this.y < -10 || this.x < -10 || this.x > width + 10) {
              this.reset(false);
            }
          }
          draw(ctx) {
            if (this.currentOpacity <= 0) return;
            ctx.beginPath();
            ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
            ctx.fillStyle = this.color + this.currentOpacity + ')';
            ctx.fill();
          }
        }

        // Initialize sparks
        for (let i = 0; i < maxParticles; i++) {
          particles.push(new Spark());
        }

        // Mouse interaction tracker
        let rx = 0;
        let ry = 0;
        let isHovered = false;

        const aboutSection = document.querySelector('.about-section-inner');
        if (aboutSection) {
          aboutSection.addEventListener('mousemove', (e) => {
            const rect = aboutSection.getBoundingClientRect();
            const mouseX = e.clientX - rect.left;
            const mouseY = e.clientY - rect.top;
            
            rx = (mouseX - width / 2) / (width / 2);
            ry = (mouseY - height / 2) / (height / 2);
            
            targetAngleY = rx * 0.5;
            targetAngleX = 0.25 + ry * 0.35;
            
            // Move glow blobs
            const orangeGlow = document.querySelector('.about-glow-orange');
            const blueGlow = document.querySelector('.about-glow-blue');
            if (orangeGlow) {
              orangeGlow.style.transform = `translate(${rx * 50}px, ${ry * 50}px)`;
            }
            if (blueGlow) {
              blueGlow.style.transform = `translate(${rx * -50}px, ${ry * -50}px)`;
            }
          });
          aboutSection.addEventListener('mouseenter', () => {
            isHovered = true;
          });
          aboutSection.addEventListener('mouseleave', () => {
            isHovered = false;
            targetAngleX = 0.25;
            targetAngleY = 0;
            
            const orangeGlow = document.querySelector('.about-glow-orange');
            const blueGlow = document.querySelector('.about-glow-blue');
            if (orangeGlow) orangeGlow.style.transform = 'none';
            if (blueGlow) blueGlow.style.transform = 'none';
          });
        }

        // Project 3D to 2D
        function project(x, y, z) {
          const distance = 3.6;
          const isDesktop = window.innerWidth > 1024;
          const scale = Math.min(width, height) * (isDesktop ? 0.25 : 0.3);
          const fov = scale / (z + distance);
          
          const centerX = isDesktop ? width * 0.88 : width / 2;
          const centerY = isDesktop ? height * 0.25 : height / 2.05;
          
          return {
            x: centerX + x * fov,
            y: centerY - y * fov,
            z: z
          };
        }

        // Rotate point in 3D
        function rotate3D(point, rx, ry) {
          const cosX = Math.cos(rx);
          const sinX = Math.sin(rx);
          let y1 = point.y * cosX - point.z * sinX;
          let z1 = point.y * sinX + point.z * cosX;

          const cosY = Math.cos(ry);
          const sinY = Math.sin(ry);
          let x2 = point.x * cosY + z1 * sinY;
          let z2 = -point.x * sinY + z1 * cosY;

          return { x: x2, y: y1, z: z2 };
        }

        let isAboutCanvasPaused = false;
        window.pauseAboutCanvas = () => {
          isAboutCanvasPaused = true;
        };
        window.resumeAboutCanvas = () => {
          if (isAboutCanvasPaused) {
            isAboutCanvasPaused = false;
            drawFrame();
          }
        };

        // Animation loop
        function drawFrame() {
          if (isAboutCanvasPaused) return;
          ctx.clearRect(0, 0, width, height);

          // Draw sparks
          for (let i = 0; i < maxParticles; i++) {
            particles[i].update();
            particles[i].draw(ctx);
          }

          // Y-axis continuous rotation speed
          const autoSpeed = isHovered ? 0.003 : 0.006;
          angleY += autoSpeed;
          
          // Lerp to target angles (mouse movement tracking)
          const lerpFactor = 0.05;
          const currentRotX = angleX + (targetAngleX - angleX) * lerpFactor;
          const currentRotY = angleY + (targetAngleY - (angleY % (Math.PI * 2))) * lerpFactor;
          angleX = currentRotX;

          // Transform & project vertices
          const projected = vertices.map(v => {
            const rotated = rotate3D(v, angleX, currentRotY);
            return project(rotated.x, rotated.y, rotated.z);
          });

          // Draw Edges
          edges.forEach(edge => {
            const p1 = projected[edge.a];
            const p2 = projected[edge.b];
            const avgZ = (p1.z + p2.z) / 2;
            
            // Map depth to opacity
            const normalizedDepth = (avgZ + 1.2) / 2.4;
            let opacity = 0.28 - normalizedDepth * 0.22;
            if (opacity < 0.04) opacity = 0.04;
            
            ctx.beginPath();
            ctx.moveTo(p1.x, p1.y);
            ctx.lineTo(p2.x, p2.y);
            ctx.strokeStyle = `rgba(234, 217, 184, ${opacity})`;
            ctx.lineWidth = avgZ < 0 ? 1.4 : 0.7;
            
            if (avgZ < -0.3) {
              ctx.shadowColor = 'rgba(234, 217, 184, 0.35)';
              ctx.shadowBlur = 6;
            } else {
              ctx.shadowBlur = 0;
            }
            ctx.stroke();
          });
          ctx.shadowBlur = 0;

          // Draw Nodes
          projected.forEach(p => {
            const size = p.z < 0 ? 3.0 : 1.8;
            const opacity = p.z < 0 ? 0.75 : 0.3;
            
            ctx.beginPath();
            ctx.arc(p.x, p.y, size, 0, Math.PI * 2);
            ctx.fillStyle = `rgba(234, 217, 184, ${opacity})`;
            if (p.z < -0.3) {
              ctx.shadowColor = 'rgba(234, 217, 184, 0.6)';
              ctx.shadowBlur = 8;
            } else {
              ctx.shadowBlur = 0;
            }
            ctx.fill();
          });
          ctx.shadowBlur = 0;

          requestAnimationFrame(drawFrame);
        }

        drawFrame();
      });

      // ============ GLOBAL SECTION INTERACTIVE 3D GLOBE ============
      let globeInitialized = false;
      function initGlobe() {
        const container = document.querySelector("[globe-container]");
        if (!container || typeof Globe === "undefined" || globeInitialized) return;
        globeInitialized = true;

        // Generate flight path arcs using a glowing gold/amber gradient
        const arcs = [...Array(12).keys()].map(() => ({
          startLat: 180 * (Math.random() - 0.5),
          startLng: 360 * (Math.random() - 0.5),
          endLat: 180 * (Math.random() - 0.5),
          endLng: 360 * (Math.random() - 0.5),
          color: ["#ead9b8", "#c5a880"]
        }));

        const points = arcs.flatMap(arc => [
          { lat: arc.startLat, lng: arc.startLng },
          { lat: arc.endLat, lng: arc.endLng }
        ]);

        const globeInstance = Globe()(container)
          .globeImageUrl("./assets/globe-map.svg")
          .showAtmosphere(true)
          .atmosphereColor("#ead9b8")
          .atmosphereAltitude(0.20)
          .backgroundColor("rgba(0,0,0,0)")
          .width(container.offsetWidth)
          .height(container.offsetHeight)
          .arcsData(arcs)
          .arcColor("color")
          .arcStroke(0.5)
          .arcDashLength(0.6)
          .arcDashGap(0.2)
          .arcDashAnimateTime(5000)
          .arcsTransitionDuration(0)
          .pointsData(points)
          .pointColor(() => "#ead9b8")
          .pointAltitude(0.01)
          .pointRadius(0.5)
          .pointResolution(8)
          .pointsTransitionDuration(0);

        // Custom specular and shine
        const material = globeInstance.globeMaterial();
        if (material) {
          material.shininess = 30;
          if (window.THREE) {
            material.color = new THREE.Color("#0a0806");
            material.specular = new THREE.Color("#ead9b8");
          }
          material.needsUpdate = true;
        }

        const controls = globeInstance.controls();
        if (controls) {
          controls.enableZoom = false;
          controls.enablePan = false;
          const polarAngle = typeof controls.getPolarAngle === "function" ? controls.getPolarAngle() : Math.PI / 2;
          controls.minPolarAngle = polarAngle;
          controls.maxPolarAngle = polarAngle;
          controls.autoRotate = true;
          controls.autoRotateSpeed = 1.5;
        }

        function resizeGlobe() {
          globeInstance.width(container.offsetWidth).height(container.offsetHeight);
        }
        window.addEventListener("resize", resizeGlobe);

        window.pauseGlobe = () => {
          if (controls) controls.autoRotate = false;
          container.style.display = 'none';
        };
        window.resumeGlobe = () => {
          container.style.display = 'block';
          if (controls) controls.autoRotate = true;
          globeInstance.width(container.offsetWidth).height(container.offsetHeight);
        };
      }

      function initGlobeMaskFollow() {
        const globeElement = document.querySelector(".globe");
        if (!globeElement) return;
        window.addEventListener("mousemove", (e) => {
          const deltaX = 75 * (0.5 - e.clientX / window.innerWidth);
          if (window.gsap) {
            gsap.to(globeElement, {
              duration: 2.4,
              ease: "power2.out",
              "--mask-x": `${50 + deltaX}%`
            });
          } else {
            globeElement.style.setProperty("--mask-x", `${50 + deltaX}%`);
          }
        });
      }

      // ============ LIGHT RAYS BACKGROUND INITIALIZATION ============
      function initLightRays() {
        const containers = document.querySelectorAll('.light-rays-bg');
        containers.forEach(container => {
          // Add glow overlays
          const glowLeft = document.createElement('div');
          glowLeft.className = 'light-rays-glow-left';
          glowLeft.setAttribute('aria-hidden', 'true');
          
          const glowRight = document.createElement('div');
          glowRight.className = 'light-rays-glow-right';
          glowRight.setAttribute('aria-hidden', 'true');
          
          container.appendChild(glowLeft);
          container.appendChild(glowRight);

          // Generate rays
          const count = 6; // Beautiful ambient count
          const cycle = 14; // Base animation cycle in seconds
          
          for (let i = 0; i < count; i++) {
            const left = 8 + Math.random() * 84;
            const rotate = -26 + Math.random() * 52;
            const width = 140 + Math.random() * 160;
            const swing = 0.8 + Math.random() * 1.6;
            const delay = Math.random() * cycle;
            const duration = cycle * (0.85 + Math.random() * 0.4);
            const intensity = 0.35 + Math.random() * 0.45; // Soft gold glow intensity
            
            const ray = document.createElement('div');
            ray.className = 'light-ray';
            ray.style.setProperty('--ray-left', `${left}%`);
            ray.style.setProperty('--ray-width', `${width}px`);
            ray.style.setProperty('--ray-rotate', `${rotate}deg`);
            ray.style.setProperty('--ray-swing', `${swing}deg`);
            ray.style.setProperty('--ray-delay', `-${delay}s`); // Start animations pre-warmed mid-cycle!
            ray.style.setProperty('--ray-duration', `${duration}s`);
            ray.style.setProperty('--ray-intensity', intensity);
            
            container.appendChild(ray);
          }
        });
      }

      document.addEventListener('DOMContentLoaded', () => {
        initGlobeMaskFollow();
        initLightRays();

        // ============ INTERSECTION OBSERVER FOR ACTIVE CANVAS LOOPS ============
        // 1. About Canvas Observer
        const aboutCanvas = document.getElementById('about-canvas');
        if (aboutCanvas) {
          const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
              if (entry.isIntersecting) {
                if (typeof window.resumeAboutCanvas === 'function') window.resumeAboutCanvas();
              } else {
                if (typeof window.pauseAboutCanvas === 'function') window.pauseAboutCanvas();
              }
            });
          }, { threshold: 0.02 });
          observer.observe(aboutCanvas);
        }

        // 2. Globe Canvas Observer — lazy-loads globe.gl script on first intersection
        const globeContainer = document.getElementById('globe-container');
        if (globeContainer) {
          let globeScriptLoaded = false;
          const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
              if (entry.isIntersecting) {
                if (!globeScriptLoaded) {
                  globeScriptLoaded = true;
                  const script = document.createElement('script');
                  script.src = 'https://cdn.jsdelivr.net/npm/globe.gl';
                  script.onload = () => {
                    if (!globeInitialized) initGlobe();
                    if (typeof window.resumeGlobe === 'function') window.resumeGlobe();
                  };
                  document.head.appendChild(script);
                } else {
                  if (!globeInitialized) initGlobe();
                  if (typeof window.resumeGlobe === 'function') window.resumeGlobe();
                }
              } else {
                if (typeof window.pauseGlobe === 'function') window.pauseGlobe();
              }
            });
          }, { threshold: 0.02 });
          observer.observe(globeContainer);
        }
      });

      // ============ THEME SWITCHER CLICK HANDLER ============
      document.addEventListener('DOMContentLoaded', () => {
        const toggleBtn = document.getElementById('theme-toggle-btn');
        if (toggleBtn) {
          toggleBtn.addEventListener('click', () => {
            const nextTheme = window.currentTheme === 'day' ? 'night' : 'day';
            switchTheme(nextTheme);
          });
        }
      });

      // ============ CLIENT APP SHOWCASE ANIMATION ============
      document.addEventListener('DOMContentLoaded', () => {
        const checkGSAP = setInterval(() => {
          if (window.gsap && window.ScrollTrigger) {
            clearInterval(checkGSAP);
            initShowcaseAnimation();
          }
        }, 100);

        function initShowcaseAnimation() {
          const section = document.querySelector('#app-showcase-section');
          const container = document.querySelector('.showcase-screens-container');
          if (!section || !container) return;

          const screen1 = container.querySelector('.screen-1');
          const screen2 = container.querySelector('.screen-2');
          const screen3 = container.querySelector('.screen-3');

          if (!screen1 || !screen2 || !screen3) return;

          // Initial properties for the screenshots
          window.gsap.set([screen1, screen2, screen3], {
            transformPerspective: 1200,
            transformOrigin: 'center center'
          });

          // Screen 1: initial off-screen state (will rise up)
          window.gsap.set(screen1, {
            opacity: 0,
            y: 160,
            scale: 0.85,
            rotationX: 15,
            rotationY: -10,
            zIndex: 4
          });

          // Other screens: initially hidden below
          window.gsap.set([screen2, screen3], {
            opacity: 0,
            y: 200,
            scale: 0.8,
            rotationX: 10,
            rotationY: 0,
            zIndex: 1
          });

          // Master ScrollTrigger timeline
          const tl = window.gsap.timeline({
            scrollTrigger: {
              trigger: section,
              start: 'top top',
              end: 'bottom bottom',
              scrub: 1.0,
              invalidateOnRefresh: true
            }
          });

          // Step 1: Rise screen 1 smoothly into focus
          tl.to(screen1, {
            opacity: 1,
            y: 0,
            scale: 1,
            rotationX: 0,
            rotationY: 0,
            duration: 0.25,
            ease: 'power2.out'
          });

          // Step 2: Screen 1 transitions out, Screen 2 transitions in
          tl.to({}, { duration: 0.08 }); // pause

          tl.to(screen1, {
            opacity: 0,
            y: -100,
            scale: 0.88,
            rotationX: -10,
            rotationY: 15,
            zIndex: 1,
            duration: 0.25,
            ease: 'power2.inOut'
          }, 's1_to_s2');

          tl.to(screen2, {
            opacity: 1,
            y: 0,
            scale: 1,
            rotationX: 0,
            rotationY: 0,
            zIndex: 4,
            duration: 0.25,
            ease: 'power2.inOut'
          }, 's1_to_s2');

          // Step 3: Final Stack Composition forms
          // Screen 2 transitions to Stack Left, Screen 1 transitions to Stack Right, Screen 3 transitions to Stack Center (Foreground)
          tl.to({}, { duration: 0.08 }); // pause

          const getStackOffset = () => window.innerWidth > 1024 ? 120 : (window.innerWidth > 480 ? 70 : 50);
          const getStackScale = () => window.innerWidth > 480 ? 0.82 : 0.78;

          // Animate Screen 2 (Alfred Chat) to Stack Left
          tl.to(screen2, {
            opacity: 0.65,
            x: () => -getStackOffset(),
            y: 20,
            scale: () => getStackScale(),
            rotationY: 20,
            rotationZ: -5,
            zIndex: 2,
            duration: 0.3,
            ease: 'power3.out'
          }, 's2_to_stack');

          // Set and animate Screen 1 (Concierge) to Stack Right
          tl.set(screen1, {
            x: () => getStackOffset(),
            y: 100,
            rotationY: -20,
            rotationZ: 5,
            scale: () => getStackScale(),
            opacity: 0,
            zIndex: 2
          }, 's2_to_stack');

          tl.to(screen1, {
            opacity: 0.65,
            y: 20,
            duration: 0.3,
            ease: 'power3.out'
          }, 's2_to_stack');

          // Bring Screen 3 (Experiences Dashboard) to Stack Center (Foreground, dominant)
          tl.to(screen3, {
            opacity: 1,
            y: -10,
            x: 0,
            scale: 0.96,
            rotationX: 0,
            rotationY: 0,
            zIndex: 5,
            duration: 0.3,
            ease: 'power3.out'
          }, 's2_to_stack');

          // Final stack hold
          tl.to({}, { duration: 0.1 });
        }
      });

      // ============ MEET ALFRED CHAT SIMULATION ============
      document.addEventListener('DOMContentLoaded', () => {
        const section = document.getElementById('how-it-works-section');
        const chatThread = document.getElementById('chat-thread');
        const footer = document.getElementById('how-it-works-footer');
        if (!section || !chatThread || !footer) return;

        let hasStarted = false;

        const observer = new IntersectionObserver((entries) => {
          entries.forEach(entry => {
            if (entry.isIntersecting && !hasStarted) {
              hasStarted = true;
              startChatSimulation();
              observer.unobserve(section);
            }
          });
        }, { threshold: 0.15 });

        observer.observe(section);

        function createMessageRow(type, contentHTML) {
          const row = document.createElement('div');
          row.className = `chat-row ${type}-row`;

          if (type === 'user') {
            row.innerHTML = `
              <div class="bubble-wrap">
                ${contentHTML}
              </div>
              <div class="chat-avatar">
                <div class="user-avatar-glow">
                  <div class="user-avatar-inner">You</div>
                </div>
              </div>
            `;
          } else if (type === 'typing') {
            row.className = `chat-row alfred-row typing-row`;
            row.innerHTML = `
              <div class="chat-avatar">
                <div class="alfred-avatar-glow">
                  <div class="alfred-avatar-inner"></div>
                </div>
              </div>
              <div class="bubble-wrap">
                <div class="typing-dots">
                  <div class="typing-dot"></div>
                  <div class="typing-dot"></div>
                  <div class="typing-dot"></div>
                </div>
              </div>
            `;
          } else {
            row.innerHTML = `
              <div class="chat-avatar">
                <div class="alfred-avatar-glow">
                  <div class="alfred-avatar-inner"></div>
                </div>
              </div>
              <div class="bubble-wrap">
                ${contentHTML}
              </div>
            `;
          }
          return row;
        }

        function appendRow(row) {
          chatThread.appendChild(row);
          // Trigger reflow for transition
          row.offsetHeight;
          row.classList.add('show');
          
          // Scroll container to bottom smoothly
          setTimeout(() => {
            row.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
          }, 50);
        }

        function removeTypingRow() {
          const typingRow = chatThread.querySelector('.typing-row');
          if (typingRow) {
            typingRow.remove();
          }
        }

        function startChatSimulation() {
          // Step 1: User request (1.0s)
          setTimeout(() => {
            const row = createMessageRow('user', '<p style="margin:0;">Alfred, I need a G650 from London to Dubai this Friday. 4 passengers, departing 9 AM.</p>');
            appendRow(row);
          }, 1000);

          // Step 2: Typing dots (2.5s)
          setTimeout(() => {
            const row = createMessageRow('typing');
            appendRow(row);
          }, 2500);

          // Step 3: Alfred response 1 (4.0s)
          setTimeout(() => {
            removeTypingRow();
            const row = createMessageRow('alfred', `
              <p style="margin:0 0 0.5rem 0;">Got it. Let me check what's available for Friday morning...</p>
              <div class="verified-network-pill">
                <div class="verified-dot"></div>
                <span>pulling from verified network...</span>
              </div>
            `);
            appendRow(row);
          }, 4000);

          // Step 4: Alfred response 2 (6.5s)
          setTimeout(() => {
            const row = createMessageRow('alfred', `
              <div style="width: 100%;">
                <p style="font-size: 1rem; margin: 0 0 1.25rem 0;">Perfect, I've got three great options for you:</p>
                <div class="options-container">
                  <div class="option-item">
                    <div class="option-main">
                      <span class="option-name">G650</span>
                      <span class="option-price">£82,400</span>
                    </div>
                    <p class="option-desc" style="margin: 0.25rem 0 0 0;">Direct flight, just under 7 hours</p>
                  </div>
                  <div class="option-item featured-option">
                    <div class="option-main">
                      <span class="option-name">Global 7500</span>
                      <span class="option-price">£94,200</span>
                    </div>
                    <p class="option-desc" style="margin: 0.25rem 0 0 0;">My recommendation — onboard Wi-Fi & full catering included</p>
                  </div>
                  <div class="option-item">
                    <div class="option-main">
                      <span class="option-name">Falcon 8X</span>
                      <span class="option-price">£87,950</span>
                    </div>
                    <p class="option-desc" style="margin: 0.25rem 0 0 0;">Comes with VIP ground transfer on both ends</p>
                  </div>
                </div>
                <p style="font-size: 0.875rem; color: rgba(229,228,226,0.6); margin: 1.25rem 0 0 0; padding-top: 0.75rem; border-top: 1px solid rgba(205,175,104,0.1);">
                  Pay securely by card. Should I go ahead and book the Global 7500?
                </p>
              </div>
            `);
            appendRow(row);
          }, 6500);

          // Step 5: User confirmation (10.0s)
          setTimeout(() => {
            const row = createMessageRow('user', '<p style="margin:0;">Yes, confirm the Global 7500 and charge my card.</p>');
            appendRow(row);
          }, 10000);

          // Step 6: Typing dots (11.0s)
          setTimeout(() => {
            const row = createMessageRow('typing');
            appendRow(row);
          }, 11000);

          // Step 7: Alfred final set (12.5s)
          setTimeout(() => {
            removeTypingRow();
            const row = createMessageRow('alfred', `
              <div style="width: 100%;">
                <div class="confirmation-tick-container">
                  <div class="spinner-icon"></div>
                  <span style="font-size: 1rem; font-weight: 500;">All Set</span>
                </div>
                <p style="margin: 0 0 0.5rem 0;">You're booked on the Global 7500. Card payment secured in escrow.</p>
                <div style="font-size: 0.875rem; color: rgba(229,228,226,0.6); margin-top: 0.75rem; line-height: 1.4;">
                  <p style="margin: 0;">I'll send over your full itinerary and chauffeur details in about 90 seconds.</p>
                  <p style="margin: 0.25rem 0 0 0;">Have a great flight ✈️</p>
                </div>
              </div>
            `);
            appendRow(row);
          }, 12500);

          // Step 8: Button & Footer fade-in (13.0s)
          setTimeout(() => {
            const completeContainer = document.createElement('div');
            completeContainer.className = 'complete-btn-container';
            completeContainer.id = 'complete-btn-container';
            completeContainer.innerHTML = `
              <div class="complete-btn">
                <svg class="complete-btn-sparkle" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="width: 20px; height: 20px;">
                  <path d="m12 3-1.912 5.813a2 2 0 0 1-1.275 1.275L3 12l5.813 1.912a2 2 0 0 1 1.275 1.275L12 21l1.912-5.813a2 2 0 0 1 1.275-1.275L21 12l-5.813-1.912a2 2 0 0 1-1.275-1.275Z"/>
                  <path d="m5 3 1 2.5L8.5 6 6 7 5 9.5 4 7 1.5 6 4 5.5Z"/>
                </svg>
                <span>Booking Complete</span>
                <span class="complete-btn-check">✓</span>
              </div>
            `;
            chatThread.appendChild(completeContainer);
            completeContainer.offsetHeight; // trigger reflow
            completeContainer.classList.add('show');


            // Scroll container to bottom smoothly
            setTimeout(() => {
              completeContainer.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
            }, 50);
          }, 13000);
        }
      });

      // ============ PARTICLES BACKGROUND SYSTEM ============
      class ParticlesBackground {
        constructor(canvasId, containerId) {
          this.canvas = document.getElementById(canvasId);
          this.container = document.getElementById(containerId);
          if (!this.canvas || !this.container) return;
          this.ctx = this.canvas.getContext('2d');
          this.circles = [];
          this.mouse = { x: 0, y: 0 };
          this.canvasSize = { w: 0, h: 0 };
          this.dpr = window.devicePixelRatio || 1;
          this.mousePosition = { x: 0, y: 0 };

          this.quantity = 250;
          this.staticity = 50;
          this.ease = 80;
          this.color = '#ffffff';
          this.vx = 0;
          this.vy = 0;

          this.init();
        }

        init() {
          this.resizeCanvas();
          this.drawParticles();
          this.animate();

          window.addEventListener('resize', () => this.resizeCanvas());

          window.addEventListener('mousemove', (e) => {
            this.mousePosition.x = e.clientX;
            this.mousePosition.y = e.clientY;
            this.onMouseMove();
          });
        }

        onMouseMove() {
          if (this.canvas) {
            const rect = this.canvas.getBoundingClientRect();
            const { w, h } = this.canvasSize;
            const x = this.mousePosition.x - rect.left - w / 2;
            const y = this.mousePosition.y - rect.top - h / 2;
            const inside = x < w / 2 && x > -w / 2 && y < h / 2 && y > -h / 2;
            if (inside) {
              this.mouse.x = x;
              this.mouse.y = y;
            }
          }
        }

        resizeCanvas() {
          if (this.container && this.canvas && this.ctx) {
            this.circles.length = 0;
            this.canvasSize.w = this.container.offsetWidth;
            this.canvasSize.h = this.container.offsetHeight;
            this.canvas.width = this.canvasSize.w * this.dpr;
            this.canvas.height = this.canvasSize.h * this.dpr;
            this.canvas.style.width = `${this.canvasSize.w}px`;
            this.canvas.style.height = `${this.canvasSize.h}px`;
            this.ctx.scale(this.dpr, this.dpr);
            this.drawParticles();
          }
        }

        hexToRgb(hex) {
          hex = hex.replace('#', '');
          const hexInt = parseInt(hex, 16);
          const red = (hexInt >> 16) & 255;
          const green = (hexInt >> 8) & 255;
          const blue = hexInt & 255;
          return [red, green, blue];
        }

        circleParams() {
          const x = Math.floor(Math.random() * this.canvasSize.w);
          const y = Math.floor(Math.random() * this.canvasSize.h);
          const translateX = 0;
          const translateY = 0;
          const size = Math.floor(Math.random() * 2) + 1;
          const alpha = 0;
          const targetAlpha = parseFloat((Math.random() * 0.6 + 0.1).toFixed(1));
          const dx = (Math.random() - 0.5) * 0.2;
          const dy = (Math.random() - 0.5) * 0.2;
          const magnetism = 0.1 + Math.random() * 4;
          return {
            x,
            y,
            translateX,
            translateY,
            size,
            alpha,
            targetAlpha,
            dx,
            dy,
            magnetism,
          };
        }

        drawCircle(circle, update = false) {
          if (this.ctx) {
            const rgb = this.hexToRgb(this.color);
            const { x, y, translateX, translateY, size, alpha } = circle;
            this.ctx.translate(translateX, translateY);
            this.ctx.beginPath();
            this.ctx.arc(x, y, size, 0, 2 * Math.PI);
            this.ctx.fillStyle = `rgba(${rgb.join(', ')}, ${alpha})`;
            this.ctx.fill();
            this.ctx.setTransform(this.dpr, 0, 0, this.dpr, 0, 0);

            if (!update) {
              this.circles.push(circle);
            }
          }
        }

        clearContext() {
          if (this.ctx) {
            this.ctx.clearRect(0, 0, this.canvasSize.w, this.canvasSize.h);
          }
        }

        drawParticles() {
          this.clearContext();
          const particleCount = this.quantity;
          for (let i = 0; i < particleCount; i++) {
            const circle = this.circleParams();
            this.drawCircle(circle);
          }
        }

        remapValue(value, start1, end1, start2, end2) {
          const remapped = ((value - start1) * (end2 - start2)) / (end1 - start1) + start2;
          return remapped > 0 ? remapped : 0;
        }

        animate() {
          this.clearContext();
          this.circles.forEach((circle, i) => {
            const edge = [
              circle.x + circle.translateX - circle.size,
              this.canvasSize.w - circle.x - circle.translateX - circle.size,
              circle.y + circle.translateY - circle.size,
              this.canvasSize.h - circle.y - circle.translateY - circle.size,
            ];
            const closestEdge = edge.reduce((a, b) => Math.min(a, b));
            const remapClosestEdge = parseFloat(this.remapValue(closestEdge, 0, 20, 0, 1).toFixed(2));
            if (remapClosestEdge > 1) {
              circle.alpha += 0.02;
              if (circle.alpha > circle.targetAlpha) {
                circle.alpha = circle.targetAlpha;
              }
            } else {
              circle.alpha = circle.targetAlpha * remapClosestEdge;
            }
            circle.x += circle.dx + this.vx;
            circle.y += circle.dy + this.vy;
            circle.translateX += (this.mouse.x / (this.staticity / circle.magnetism) - circle.translateX) / this.ease;
            circle.translateY += (this.mouse.y / (this.staticity / circle.magnetism) - circle.translateY) / this.ease;

            if (
              circle.x < -circle.size ||
              circle.x > this.canvasSize.w + circle.size ||
              circle.y < -circle.size ||
              circle.y > this.canvasSize.h + circle.size
            ) {
              this.circles.splice(i, 1);
              const newCircle = this.circleParams();
              this.drawCircle(newCircle);
            } else {
              this.drawCircle(
                {
                  ...circle,
                  x: circle.x,
                  y: circle.y,
                  translateX: circle.translateX,
                  translateY: circle.translateY,
                  alpha: circle.alpha,
                },
                true
              );
            }
          });
          if (!this._paused) {
            requestAnimationFrame(() => this.animate());
          }
        }

        pause() {
          this._paused = true;
        }

        resume() {
          if (this._paused) {
            this._paused = false;
            requestAnimationFrame(() => this.animate());
          }
        }

        updateColor(newColor) {
          this.color = newColor;
        }
      }

      // ============ GSAP TEXT ANIMATIONS BOOTSTRAP ============
      function initTextAnimations() {
        if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
        const gsap = window.gsap;
        const ScrollTrigger = window.ScrollTrigger;
        if (!gsap || !ScrollTrigger) return;

        // 1. Text-Splitting Utilities
        function splitTextIntoWords(el) {
          const text = el.textContent.trim().replace(/\s+/g, ' ');
          el.innerHTML = '';
          text.split(' ').forEach((word, idx, arr) => {
            const outer = document.createElement('span');
            outer.className = 'split-word';
            outer.style.display = 'inline-block';
            outer.style.overflow = 'hidden';
            outer.style.verticalAlign = 'top';

            const inner = document.createElement('span');
            inner.textContent = word;
            inner.className = 'split-word-inner';
            inner.style.display = 'inline-block';
            inner.style.willChange = 'transform';

            outer.appendChild(inner);
            el.appendChild(outer);
            if (idx < arr.length - 1) {
              el.appendChild(document.createTextNode(' '));
            }
          });
        }

        function splitTextIntoChars(el) {
          const text = el.textContent.trim();
          el.innerHTML = '';
          text.split('').forEach(char => {
            const span = document.createElement('span');
            span.textContent = char === ' ' ? '\u00A0' : char;
            span.style.display = 'inline-block';
            span.className = 'char-item';
            span.style.willChange = 'transform';
            el.appendChild(span);
          });
        }

        // 2. Tag/Badge Animation Setup
        document.querySelectorAll('[data-tag-anim]').forEach(tag => {
          gsap.from(tag, {
            opacity: 0,
            y: 15,
            duration: 0.6,
            ease: 'power2.out',
            scrollTrigger: {
              trigger: tag,
              start: 'top 92%',
              toggleActions: 'play none none reverse'
            }
          });
        });

        // 3. Title Reveal Animation Setup
        document.querySelectorAll('[data-title-anim]').forEach(title => {
          splitTextIntoWords(title);
          gsap.from(title.querySelectorAll('.split-word-inner'), {
            yPercent: 100,
            opacity: 0,
            duration: 0.9,
            ease: 'power3.out',
            stagger: 0.04,
            scrollTrigger: {
              trigger: title,
              start: 'top 88%',
              toggleActions: 'play none none reverse'
            }
          });
        });

        // 4. Paragraph/Body Reveal Animation Setup
        document.querySelectorAll('[data-text-anim]').forEach(text => {
          splitTextIntoWords(text);
          gsap.from(text.querySelectorAll('.split-word-inner'), {
            yPercent: 70,
            opacity: 0,
            duration: 1.0,
            ease: 'power2.out',
            stagger: 0.02,
            scrollTrigger: {
              trigger: text,
              start: 'top 92%',
              toggleActions: 'play none none reverse'
            }
          });
        });

        // 5. 3D Words Rotate Animation Setup
        document.querySelectorAll('[words-rotate-in]').forEach(el => {
          splitTextIntoWords(el);
          const words = el.querySelectorAll('.split-word-inner');
          gsap.set(words, { transformPerspective: 1000 });
          gsap.from(words, {
            rotationX: -90,
            opacity: 0,
            duration: 0.9,
            ease: 'power2.out',
            stagger: 0.05,
            scrollTrigger: {
              trigger: el,
              start: 'top 90%',
              toggleActions: 'play none none reverse'
            }
          });
        });

        // 6. Hover Link Swap Setup
        document.querySelectorAll('[data-gsap="btn"]').forEach(link => {
          const originalText = link.textContent.trim();
          link.innerHTML = '';
          link.style.position = 'relative';
          link.style.overflow = 'hidden';
          link.style.display = 'inline-block';

          const ogSpan = document.createElement('span');
          ogSpan.className = 'og-text';
          ogSpan.style.display = 'inline-block';
          ogSpan.textContent = originalText;

          const cloneSpan = document.createElement('span');
          cloneSpan.className = 'clone-text';
          cloneSpan.style.position = 'absolute';
          cloneSpan.style.top = '0';
          cloneSpan.style.left = '0';
          cloneSpan.style.width = '100%';
          cloneSpan.style.pointerEvents = 'none';
          cloneSpan.style.display = 'inline-block';
          cloneSpan.textContent = originalText;

          link.appendChild(ogSpan);
          link.appendChild(cloneSpan);

          splitTextIntoChars(ogSpan);
          splitTextIntoChars(cloneSpan);

          const ogChars = ogSpan.querySelectorAll('.char-item');
          const cloneChars = cloneSpan.querySelectorAll('.char-item');

          gsap.set(cloneChars, { yPercent: 100, opacity: 0 });

          const tl = gsap.timeline({ paused: true });
          tl.to(ogChars, { yPercent: -100, opacity: 0, stagger: 0.03, duration: 0.35, ease: 'power2.inOut' })
            .to(cloneChars, { yPercent: 0, opacity: 1, stagger: 0.03, duration: 0.35, ease: 'power2.inOut' }, 0);

          link.addEventListener('mouseenter', () => tl.play());
          link.addEventListener('mouseleave', () => tl.reverse());
        });

        // 7. Finale Tagline Reveal Setup
        const tagline = document.querySelector('.finale-tagline');
        if (tagline) {
          gsap.from(tagline.querySelectorAll('.reveal-line > span'), {
            yPercent: 100,
            opacity: 0,
            duration: 1.1,
            ease: 'power3.out',
            stagger: 0.12,
            scrollTrigger: {
              trigger: tagline,
              start: 'top 88%',
              toggleActions: 'play none none reverse'
            }
          });
        }

      }

      // Initialize Particles when DOM is ready (only on desktop for performance)
      document.addEventListener('DOMContentLoaded', () => {
        if (window.matchMedia('(min-width: 1024px)').matches) {
          window.particlesBg = new ParticlesBackground('particles-canvas', 'site-particles');
        }
        
        // Initial color setup
        if (window.particlesBg) {
          const brandGold = getComputedStyle(document.documentElement).getPropertyValue('--color-accent').trim() || '#ead9b8';
          const whiteHover = getComputedStyle(document.documentElement).getPropertyValue('--color-accent-hover').trim() || '#ffffff';
          window.particlesBg.updateColor(window.currentTheme === 'day' ? brandGold : whiteHover);
        }

        // Setup ScrollTrigger to toggle particles visibility and run text animations
        const checkGSAP = setInterval(() => {
          if (window.ScrollTrigger && window.gsap) {
            clearInterval(checkGSAP);
            ScrollTrigger.create({
              trigger: '.combined-about-section',
              start: 'top bottom',
              onEnter: () => {
                gsap.to('#site-particles', { opacity: 1, duration: 1.0, ease: 'power2.out' });
                if (window.particlesBg && typeof window.particlesBg.resume === 'function') window.particlesBg.resume();
              },
              onLeaveBack: () => {
                gsap.to('#site-particles', { opacity: 0, duration: 0.8, ease: 'power2.out' });
                if (window.particlesBg && typeof window.particlesBg.pause === 'function') window.particlesBg.pause();
              },
              onLeave: () => {
                if (window.particlesBg && typeof window.particlesBg.pause === 'function') window.particlesBg.pause();
              },
              onEnterBack: () => {
                if (window.particlesBg && typeof window.particlesBg.resume === 'function') window.particlesBg.resume();
              }
            });
            initTextAnimations();
          }
        }, 100);
      });

      // ============ FRAME CHECKER DEBUG SYSTEM ============
      function initFrameChecker() {
        const chk = document.createElement('div');
        chk.id = 'frame-checker';
        chk.style.cssText = 'position:fixed; bottom:20px; right:20px; z-index:999999; background:rgba(8, 8, 10, 0.95); color:#EDE7DA; padding:12px 18px; font-family:"JetBrains Mono", monospace; border:1px solid #D4AF37; border-radius:6px; font-size:11px; box-shadow:0 8px 32px rgba(0,0,0,0.5); display:flex; flex-direction:column; gap:6px; user-select:none; cursor:pointer;';
        chk.innerHTML = `
          <div style="font-weight:700; color:#D4AF37; border-bottom:1px solid rgba(212,175,55,0.2); padding-bottom:4px; margin-bottom:2px; letter-spacing:0.05em; text-transform:uppercase; display:flex; justify-content:space-between; align-items:center; gap:8px;"><span>Frame Checker</span><span style="font-size:9px; opacity:0.6;">(Click to hide, press "F" to show)</span></div>
          <div>Scroll Y: <span id="chk-scroll" style="color:#fff;">0px</span></div>
          <div>Scroll %: <span id="chk-pct" style="color:#fff;">0.00%</span></div>
          <div>Hero Frame: <span id="chk-frame" style="color:#fff;">0</span> / <span id="chk-frame-total">0</span></div>
          <div>Services Frame: <span id="chk-services-frame" style="color:#fff;">0</span></div>
        `;
        document.body.appendChild(chk);

        chk.addEventListener('click', () => {
          chk.style.display = 'none';
        });

        window.addEventListener('keydown', (e) => {
          if (e.key.toLowerCase() === 'f') {
            chk.style.display = chk.style.display === 'none' ? 'flex' : 'none';
          }
        });

        const chkScroll = document.getElementById('chk-scroll');
        const chkPct = document.getElementById('chk-pct');
        const chkFrame = document.getElementById('chk-frame');
        const chkFrameTotal = document.getElementById('chk-frame-total');
        const chkServicesFrame = document.getElementById('chk-services-frame');

        let lastHeroTrigger = null;

        function updateChecker() {
          if (chk.style.display === 'none') {
            requestAnimationFrame(updateChecker);
            return;
          }

          const scrollY = window.scrollY;
          chkScroll.textContent = `${scrollY}px`;

          if (window.ScrollTrigger) {
            if (!lastHeroTrigger) {
              const heroEl = document.getElementById('hero');
              if (heroEl) {
                lastHeroTrigger = window.ScrollTrigger.getAll().find(t => t.trigger === heroEl);
              }
            }

            if (lastHeroTrigger) {
              chkPct.textContent = `${(lastHeroTrigger.progress * 100).toFixed(2)}%`;
              const total = window.activeConfig ? window.activeConfig.frameCount : 992;
              chkFrameTotal.textContent = total;
              const current = Math.round(lastHeroTrigger.progress * (total - 1));
              chkFrame.textContent = isNaN(current) ? 0 : Math.max(0, current);
            }
          }

          if (window.servicesAir) {
            const currentServicesFrame = Math.round(window.servicesAir.frame) + 801;
            chkServicesFrame.textContent = isNaN(currentServicesFrame) ? 801 : currentServicesFrame;
          } else {
            chkServicesFrame.textContent = '--';
          }

          requestAnimationFrame(updateChecker);
        }

        requestAnimationFrame(updateChecker);
      }

      if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initFrameChecker);
      } else {
        initFrameChecker();
      }
    