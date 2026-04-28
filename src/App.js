import { useState, useEffect, useCallback } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import Lenis from "lenis";
import "./App.css";

function App() {
  // ── Smooth scrolling via Lenis ────────────────────────────────────
  useEffect(() => {
    const lenis = new Lenis({
      duration: 1.2,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)), // https://www.desmos.com/calculator/brs54l4xou
      direction: 'vertical',
      gestureDirection: 'vertical',
      smooth: true,
      mouseMultiplier: 1,
      smoothTouch: false,
      touchMultiplier: 2,
      infinite: false,
    });

    lenis.on("scroll", ScrollTrigger.update);

    gsap.ticker.add((time) => {
      lenis.raf(time * 1000);
    });

    gsap.ticker.lagSmoothing(0);

    return () => {
      lenis.destroy();
    };
  }, []);


  /* ─── Smooth scrolling via Lenis (Yesterday's Stable) ─── */
  useEffect(() => {
    const lenis = new Lenis({
      duration: 1.2,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      smooth: true,
    });

    lenis.on("scroll", ScrollTrigger.update);
    gsap.ticker.add((time) => {
      lenis.raf(time * 1000);
    });
    gsap.ticker.lagSmoothing(0);

    return () => lenis.destroy();
  }, []);

  /* ─── Stacking Cards & Reveals (Yesterday's Stable) ─── */
  useEffect(() => {
    gsap.registerPlugin(ScrollTrigger);

    const ctx = gsap.context(() => {
      const cards = gsap.utils.toArray(".card");
      const mm = gsap.matchMedia();

      mm.add({
        isDesktop: "(min-width: 1025px)",
        isTablet: "(min-width: 769px) and (max-width: 1024px)",
        isMobile: "(max-width: 768px)"
      }, (context) => {
        const { isDesktop, isTablet } = context.conditions;
        const baseOffset = isDesktop ? 100 : (isTablet ? 90 : 70);
        const step = isDesktop ? 70 : (isTablet ? 50 : 40);

        cards.forEach((card, i) => {
          gsap.set(card, { zIndex: (i + 1) * 10 });

          // Pin the card
          ScrollTrigger.create({
            trigger: card,
            start: `top top+=${baseOffset + i * step}`,
            endTrigger: ".containerwhat",
            end: "bottom top+=200",
            pin: true,
            pinSpacing: false,
            invalidateOnRefresh: true,
          });

          // Smooth transition as NEXT card comes in
          if (i < cards.length - 1) {
            gsap.to(card, {
              opacity: 1,
              scale: 0.98,
              scrollTrigger: {
                trigger: cards[i + 1],
                start: "top center+=100",
                end: "top top",
                scrub: true,
              },
            });
          }
        });
      });
    });

    return () => ctx.revert();
  }, []);

  /* ─── Hero Image Zoom (Yesterday's Stable) ─── */
  useEffect(() => {
    gsap.registerPlugin(ScrollTrigger);
    const mm = gsap.matchMedia();

    mm.add("(min-width: 481px)", () => {
      const getFullscreenTransform = () => {
        const img = document.querySelector(".hero .right img");
        if (!img) return { x: 0, y: 0, scale: 1 };
        const currentTransform = img.style.transform;
        img.style.transform = "none";
        const rect = img.getBoundingClientRect();
        img.style.transform = currentTransform;
        const targetWidth = window.innerWidth;
        const targetHeight = window.innerHeight;
        const scaleX = targetWidth / rect.width;
        const scaleY = targetHeight / rect.height;
        const scale = Math.max(scaleX, scaleY) * 1.1;
        const imgCenterX = rect.left + rect.width / 2;
        const imgCenterY = rect.top + rect.height / 2;
        const screenCenterX = targetWidth / 2;
        const screenCenterY = targetHeight / 2;
        return { x: screenCenterX - imgCenterX, y: screenCenterY - imgCenterY, scale: scale };
      };

      const heroTl = gsap.timeline({
        scrollTrigger: {
          trigger: ".home-wrapper",
          start: "top top",
          end: "+=150%",
          scrub: 1.2,
          invalidateOnRefresh: true,
        },
      });

      heroTl.to(".hero .left", { y: -250, opacity: 0, ease: "power2.inOut", duration: 1 }, 0);
      heroTl.to(".hero .right img", {
        scale: () => getFullscreenTransform().scale,
        x: () => getFullscreenTransform().x,
        y: () => getFullscreenTransform().y,
        ease: "power2.inOut",
        duration: 1
      }, 0);

      return () => heroTl.kill();
    });
    return () => mm.revert();
  }, []);

  /* ─── Horizontal Scroll Wheel (Yesterday's Stable) ─── */
  useEffect(() => {
    const scrollContainer = document.querySelector('.horizontal-scroll');
    if (!scrollContainer) return;
    const handleWheel = (e) => {
      if (e.deltaY !== 0) {
        const isAtStart = scrollContainer.scrollLeft === 0;
        const isAtEnd = scrollContainer.scrollLeft + scrollContainer.clientWidth >= scrollContainer.scrollWidth - 1;
        if (!isAtStart && e.deltaY < 0) {
          e.preventDefault();
          scrollContainer.scrollBy({ left: e.deltaY, behavior: 'auto' });
        } else if (!isAtEnd && e.deltaY > 0) {
          e.preventDefault();
          scrollContainer.scrollBy({ left: e.deltaY, behavior: 'auto' });
        }
      }
    };
    scrollContainer.addEventListener('wheel', handleWheel, { passive: false });
    
    // Final safety refresh to ensure all triggers are aligned
    const timer = setTimeout(() => {
      ScrollTrigger.refresh();
    }, 1000);

    return () => {
      scrollContainer.removeEventListener('wheel', handleWheel);
      clearTimeout(timer);
    };
  }, []);

  // ── Horizontal Scroll via Mouse Wheel ─────────────────────────────
  useEffect(() => {
    const scrollContainer = document.querySelector('.horizontal-scroll');
    if (!scrollContainer) return;

    const handleWheel = (e) => {
      // If we are scrolling vertically
      if (e.deltaY !== 0) {
        const isAtStart = scrollContainer.scrollLeft === 0;
        // Add a small 1px threshold for floating point rounding issues
        const isAtEnd = scrollContainer.scrollLeft + scrollContainer.clientWidth >= scrollContainer.scrollWidth - 1;

        if (!isAtStart && e.deltaY < 0) {
          e.preventDefault();
          scrollContainer.scrollBy({ left: e.deltaY, behavior: 'auto' });
        } else if (!isAtEnd && e.deltaY > 0) {
          e.preventDefault();
          scrollContainer.scrollBy({ left: e.deltaY, behavior: 'auto' });
        }
      }
    };

    // passive: false is required to use preventDefault()
    scrollContainer.addEventListener('wheel', handleWheel, { passive: false });

    return () => {
      scrollContainer.removeEventListener('wheel', handleWheel);
    };
  }, []);


  const [menuOpen, setMenuOpen] = useState(false);
  const [activeSection, setActiveSection] = useState("home");

  // ── Scrollspy via IntersectionObserver ──────────────────────────
  useEffect(() => {
    const sectionIds = ["home", "about", "services", "portfolio", "clients", "contact", "footer"];

    const observers = sectionIds.map((id) => {
      const el = document.getElementById(id);
      if (!el) return null;

      const observer = new IntersectionObserver(
        ([entry]) => {
          if (entry.isIntersecting) setActiveSection(id);
        },
        // Trigger when section occupies the middle band of the viewport
        { rootMargin: "-35% 0px -60% 0px", threshold: 0 }
      );
      observer.observe(el);
      return observer;
    });

    return () => observers.forEach((obs) => obs && obs.disconnect());
  }, []);

  // ── Ensure ScrollTrigger recalculates after images load ────────
  useEffect(() => {
    const img = document.querySelector(".hero .right img");
    if (img) {
      if (img.complete) {
        ScrollTrigger.refresh();
      } else {
        img.addEventListener("load", () => ScrollTrigger.refresh());
      }
    }
  }, []);


  // ── Smooth scroll helper ─────────────────────────────────────────
  const scrollTo = useCallback((id) => {
    const el = document.getElementById(id);
    if (el) el.scrollIntoView({ behavior: "smooth" });
    setMenuOpen(false); // close mobile menu after tap
  }, []);


  return (
    <>
      {/* Navbar */}
      <nav className="navbar">
        <img
          src="/logo.png"
          alt="logo"
          className="logo"
          style={{ cursor: "pointer" }}
          onClick={() => scrollTo("home")}
        />

        <div className="hamburger" onClick={() => setMenuOpen(!menuOpen)}>
          ☰
        </div>

        <ul className={`nav-links ${menuOpen ? "active" : ""}`}>
          <li
            className={activeSection === "home" ? "active" : ""}
            onClick={() => scrollTo("home")}
          >HOME</li>
          <li
            className={activeSection === "about" ? "active" : ""}
            onClick={() => scrollTo("about")}
          >WHO WE ARE</li>
          <li
            className={activeSection === "services" ? "active" : ""}
            onClick={() => scrollTo("services")}
          >WHAT WE DO</li>
          <li
            className={activeSection === "portfolio" ? "active" : ""}
            onClick={() => scrollTo("portfolio")}
          >PORTFOLIO</li>
          <li
            className={activeSection === "clients" ? "active" : ""}
            onClick={() => scrollTo("clients")}
          >CLIENTS</li>
          <li
            className={activeSection === "contact" ? "active" : ""}
            onClick={() => scrollTo("contact")}
          >CONTACT</li>
        </ul>
      </nav>

      <div className="home-wrapper" id="home">
        <div className="home">
          {/* Hero */}
          <section className="hero">
            <div className="left">
              <h1>
                Fast Growing Media Agency <br />
                based in Chennai.
              </h1>

              <div className="services">
                <p>Advertising</p>
                <p>Creatives</p>
                <p>Tech &amp; Innovation</p>
              </div>
            </div>

            <div className="right">
              <img src="/image1.png" alt="banner" />
            </div>
          </section>
        </div>
      </div>

      <section className="about-section" id="about">
        {/* Background Logo (Image 2 style) */}
        <img
          src="/p_blur.png"
          alt="bg logo"
          className="pd-about-bg-logo"
        />

        {/* Top Icon */}
        <div className="about-icon reveal">
          <img src="/icon.png" alt="P Logo" />
        </div>

        {/* Description */}
        <p className="about-text reveal">
          Push digital creates impactful marketing and delivers high-performance advertising campaigns for both
          emerging and established businesses. Driven by change, we continuously adapt to evolving market trends,
          crafting innovative and interactive marketing solutions powered by a dynamic team focused on achieving
          real business growth.
        </p>
        <div className="about-bottom">
          <div>
            <img className="pushlogo" src="/logo.png" alt="brand" />
            {/* Left Stats */}

            <div className="stats reveal">

              <div className="stat-box">
                <h2>500+</h2>
                <p>Projects</p>
              </div>

              <div className="stat-box">
                <h2>75+</h2>
                <p>Clients</p>
              </div>

              <div className="stat-box">
                <h2>5+</h2>
                <p>Year Experience</p>
              </div>

              <div className="stat-box">
                <h2>3+</h2>
                <p>Countries</p>
              </div>
            </div>
          </div>

          {/* Right Text */}
          <div className="about-info reveal">
            <div className="brand-logos">

              <img src="/jun.png" alt="brand" />
              <img src="/zeb.png" alt="brand" />
              <img src="/Dec.png" alt="brand" />
              <img src="/el.png" alt="brand" />
              <img src="/sr.png" alt="brand" />
              {/* <img src="/el.png" alt="brand" /> */}
            </div>

            <p className="understand">
              We understand your challenges and provide comprehensive, intelligent, digital and proven solutions.
            </p>
            <p>
              Our digital agency helps you to:
            </p>
          </div>


        </div>
        <div className="horizontal-scroll" data-lenis-prevent="true">
          <div className="h-box">
            <div className="box-top">
              <img src="/retail.png" alt="icon" className="icon-img" />
              <span className="tag">#presence</span>
            </div>
            <h3>Corporate</h3>
            <p>Strategic brand placements that strengthen corporate identity and create lasting professional impressions.</p>
          </div>

          <div className="h-box">
            <div className="box-top">
              <img src="/hea.png" alt="icon" className="icon-img" />
              <span className="tag">#trust</span>
            </div>
            <h3>Healthcare</h3>
            <p>Compassion-driven campaigns that build credibility, educate audiences, and inspire confidence in care.</p>
          </div>

          <div className="h-box">
            <div className="box-top">
              <img src="/hea.png" alt="icon" className="icon-img" />
              <span className="tag">#mobility</span>
            </div>
            <h3>Automobile</h3>
            <p>Dynamic outdoor solutions that accelerate brand recall and capture attention on every road.</p>
          </div>

          <div className="h-box">
            <div className="box-top">
              <img src="/hea.png" alt="icon" className="icon-img" />
              <span className="tag">#impact</span>
            </div>
            <h3>Political</h3>
            <p>Powerful messaging strategies that connect with the masses and create strong public influence.</p>
          </div>

          <div className="h-box">
            <div className="box-top">
              <img src="/hea.png" alt="icon" className="icon-img" />
              <span className="tag">#buzz</span>
            </div>
            <h3>Entertainment</h3>
            <p>High-energy campaigns that generate excitement, drive audience engagement, and amplify launches.</p>
          </div>

          <div className="h-box">
            <div className="box-top">
              <img src="/hea.png" alt="icon" className="icon-img" />
              <span className="tag">#reach</span>
            </div>
            <h3>FMCG</h3>
            <p>Mass visibility campaigns designed to influence daily consumers and maximize brand penetration.</p>
          </div>

          <div className="h-box">
            <div className="box-top">
              <img src="/hea.png" alt="icon" className="icon-img" />
              <span className="tag">#scale</span>
            </div>
            <h3>Infrastructure</h3>
            <p>Large-format media that complements big projects and builds strong public awareness at scale.</p>
          </div>
        </div>
      </section>




      <section className="whatwedo" id="services">
        <div className="containerwhat">
          <h1 className="title">What we do</h1>

          <div className="top-row">
            <span className="services">Services</span>
            <p className="description">
              Ready To Scale Your Brand? Get In Touch And Let's Discuss How Can We
              Drive Measurable Growth For Your Business
            </p>
          </div>

          {/* Card 1 */}
          <div className="card">
            <div className="card-text">
              <span className="tag2">(01) Advertise</span>
              <h3>
                Smart campaigns with tangible and measurable results.
              </h3>
              <ul>
                <li>→ Performance Marketing</li>
                <li>→ Digital Advertising</li>
                <li>→ Social Media Marketing</li>
              </ul>
            </div>
            <div className="card-img">
              <img src="/add.png" alt="service" />
            </div>
          </div>

          {/* Card 2 */}
          <div className="card">
            <div className="card-text">
              <span className="tag2">(02) Create</span>
              <h3>
                Eye-catching creative that stops the scroll and starts conversations.
              </h3>
              <ul>
                <li>→ OOH Advertising</li>
                <li>→ In Film Branding</li>
                <li>→ BTL Marketing</li>
              </ul>
            </div>
            <div className="card-img">
              <img src="/crea.png" alt="service" />
            </div>
          </div>

          {/* Card 3 */}
          <div className="card">
            <div className="card-text">
              <span className="tag2">(03) Tech &amp; Innovate</span>
              <h3>
                Future-forward tech solutions that set you apart.
              </h3>
              <ul>
                <li>→ Web Development</li>
                <li>→ UI/UX Design</li>
                <li>→ E-commerce Products</li>
              </ul>
            </div>
            <div className="card-img">
              <img src="/tech.png" alt="service" />
            </div>
          </div>
        </div>
      </section>

      <section className="fresh" id="portfolio">
        <div className="containerfresh">

          {/* Header */}
          <div className="header reveal">
            <div>
              <h1>Fresh creations<br />of the team</h1>
              <span className="sub">Recent agency projects</span>
            </div>

            <div className="projects-link">
              <a href="#">Discover all the projects</a>
            </div>
          </div>

          {/* Main Card */}
          <div className="project-card reveal">

            {/* Left Image */}
            <div className="main-img reveal">
              <img src="/news.png" alt="project" />
            </div>

            {/* Content */}
            <div className="content reveal">
              <h2>Company Name</h2>
              <p>A clear direction for a strong digital presence</p>

              <button className="btn">
                View the project →
              </button>

              {/* Bottom small images */}
              <div className="mini-images">
                <img src="/com.png" alt="mini" />
                <img src="/cap.png" alt="mini" />
              </div>
            </div>

          </div>

        </div>
      </section>

      <section className="pd-testimonials" id="clients">
        <div className="pd-testimonials-container">

          {/* LEFT */}
          <div className="pd-testimonials-left reveal">
            <p className="pd-testimonials-rating">5/5 ★★★★★ (03)</p>
            <h1 className="pd-testimonials-title">
              What our agency <br /> clients say
            </h1>
          </div>

          {/* RIGHT */}
          <div className="pd-testimonials-right">

            {/* Card */}
            <div className="pd-testimonials-card reveal">
              <p className="pd-testimonials-quote">
                ❝ The recent work you have done for us is exemplary. Keep creating these kind of extraordinary works. Team work at it's best! Looking forward for a long term association with them
              </p>

              <div className="pd-testimonials-user">
                <img src="/boy.png" alt="user" />
                <div>
                  <h4 className="pd-testimonials-name">Senthil Pandian</h4>
                  <span className="pd-testimonials-role">Banquet Studios</span>
                </div>
              </div>
            </div>

            {/* Repeat cards same way */}
            <div className="pd-testimonials-card reveal">
              <p className="pd-testimonials-quote">
                ❝One of the best Advertising and Branding Agency in Chennai. specialized in Strategy and branding. love the creative efforts of Push Digital.
              </p>

              <div className="pd-testimonials-user">
                <img src="/girl.png" alt="user" />
                <div>
                  <h4 className="pd-testimonials-name">Sathya</h4>
                  <span className="pd-testimonials-role">Raasi Dance Studio</span>
                </div>
              </div>
            </div>

            <div className="pd-testimonials-card reveal">
              <p className="pd-testimonials-quote">
                ❝ Highly creative and fast paced with out of the box creative ideas and concepts. Highly recommended! Thanks to the team once again.
              </p>

              <div className="pd-testimonials-user">
                <img src="/boy2.png" alt="user" />
                <div>
                  <h4 className="pd-testimonials-name">Joseph Shakin</h4>
                  <span className="pd-testimonials-role">Addtech Networks</span>
                </div>
              </div>
            </div>

          </div>

        </div>
      </section>

      <section className="pd-cta" id="contact">
        <div className="pd-cta-box reveal">
          <h2 className="pd-cta-title">
            Push Your Brand Into the Real World
          </h2>

          <p className="pd-cta-text">
            At Push.digital, we turn streets into stories—delivering high-impact
            outdoor advertising that captures attention, builds recall, and drives
            real-world results.
          </p>

          <button className="pd-cta-btn">
            Contact Us <span>↗</span>
          </button>
        </div>
      </section>

      <footer className="pd-footer" id="footer">
        <div className="pd-footer-container">

          {/* LEFT */}
          <div className="pd-footer-left">
            <img
              src="/logo.png"
              alt="Push Digital"
              className="pd-footer-logo"
            />

            <p className="pd-footer-desc">
              We're PUSH DIGITAL, Team Of Experienced Professionals With Expertise
              Industry Knowledge Of Implementing New Strategies And Innovative
              Ideas Which Set Out To Make The Future Happen.
            </p>
          </div>

          {/* MIDDLE */}
          <div className="pd-footer-middle">
            <h4 className="pd-footer-heading">Services</h4>
            <ul>
              <li>Advertising</li>
              <li>Creatives</li>
              <li>Tech &amp; Innovation</li>
            </ul>

            <div className="pd-footer-social">
              <p>We Are In</p>
              <img className="fd" src="face.png" alt="facebook" />
              <img className="fc" src="insta.png" alt="instagram" />
              <img className="fc" src="x.png" alt="twitter" />
              <img className="fc" src="link.png" alt="linkedin" />
              <img className="fc" src="you.png" alt="youtube" />
            </div>
          </div>

          {/* RIGHT */}
          <div className="pd-footer-right">
            <p className="pd-footer-news">
              Get Monthly Updates On The Newest Design Stories And Case Studies
              Straight In Your Mailbox.
            </p>

            <span className="pd-footer-subscribe-text">
              Subscribe Now!
            </span>

            <div className="pd-footer-input-box">
              <input type="email" placeholder="Email Id" />
              <button>SUBSCRIBE</button>
            </div>
          </div>

        </div>

        {/* BOTTOM */}
        <div className="pd-footer-bottom">
          <p>Copyright© 2024 Push Digital. All Rights Reserved</p>
        </div>
      </footer>

    </>

  );
}

export default App;