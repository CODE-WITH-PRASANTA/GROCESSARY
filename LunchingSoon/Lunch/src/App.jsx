import { useEffect, useState } from "react";
import Swal from "sweetalert2";
import "./App.css";
import logo from "./assets/Grocessary Sathi.png";

function App() {
  // Target date set dynamically to the 31st of the current month at 23:59:59
  const [launchDate] = useState(() => {
    const target = new Date();
    target.setDate(31);
    target.setHours(23, 59, 59, 999);
    return target.getTime();
  });

  const calculateTime = () => {
    const now = new Date().getTime();
    const distance = launchDate - now;

    if (distance <= 0) {
      return { days: 0, hours: 0, minutes: 0, seconds: 0 };
    }

    return {
      days: Math.floor(distance / (1000 * 60 * 60 * 24)),
      hours: Math.floor(
        (distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)
      ),
      minutes: Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60)),
      seconds: Math.floor((distance % (1000 * 60)) / 1000),
    };
  };

  const [timeLeft, setTimeLeft] = useState(calculateTime());
  const [name, setName] = useState("");
  const [mobile, setMobile] = useState("");

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft(calculateTime());
    }, 1000);

    return () => clearInterval(timer);
  }, [launchDate]);

  const notifyWhatsapp = (e) => {
    e.preventDefault();

    if (!name.trim() || !mobile.trim()) {
      Swal.fire({
        title: "Incomplete Details",
        text: "Please enter both your name and mobile number to subscribe.",
        icon: "warning",
        confirmButtonColor: "#10b981",
        background: "#161b22",
        color: "#ffffff",
        customClass: {
          popup: "swal-3d-popup",
        },
      });
      return;
    }

    // Standard 10-digit mobile number validation
    const mobileRegex = /^[6-9]\d{9}$/;
    if (!mobileRegex.test(mobile.trim())) {
      Swal.fire({
        title: "Invalid Mobile Number",
        text: "Please enter a valid 10-digit mobile number.",
        icon: "error",
        confirmButtonColor: "#ef4444",
        background: "#161b22",
        color: "#ffffff",
        customClass: {
          popup: "swal-3d-popup",
        },
      });
      return;
    }

    const message = `Hello GrocerySathi 👋\n\nI want to get notified when GrocerySathi launches.\n\nName : ${name.trim()}\nMobile : ${mobile.trim()}`;

    Swal.fire({
      title: "Redirecting to WhatsApp",
      text: "We are opening WhatsApp so you can send your notification request directly!",
      icon: "success",
      confirmButtonColor: "#10b981",
      background: "#161b22",
      color: "#ffffff",
      customClass: {
        popup: "swal-3d-popup",
      },
    }).then(() => {
      window.open(
        `https://wa.me/919887868746?text=${encodeURIComponent(message)}`,
        "_blank"
      );
    });
  };

  return (
    <div className="hero">
      <div className="blur one"></div>
      <div className="blur two"></div>
      <div className="blur three"></div>

      <div className="card">
        <div className="logo-container">
          <img src={logo} className="logo" alt="GrocerySathi Logo" />
        </div>

        <h1>Your Daily Grocery Partner</h1>
        <h2 className="glitch-text">LAUNCHING ON</h2>

        <p className="subtitle">
          Fresh Fruits <span className="dot">•</span> Vegetables{" "}
          <span className="dot">•</span> Grocery <span className="dot">•</span>{" "}
          Daily Essentials delivered straight to your door.
        </p>

        <div className="timer">
          <div className="box">
            <h3>{String(timeLeft.days).padStart(2, "0")}</h3>
            <span>DAYS</span>
          </div>
          <div className="box">
            <h3>{String(timeLeft.hours).padStart(2, "0")}</h3>
            <span>HOURS</span>
          </div>
          <div className="box">
            <h3>{String(timeLeft.minutes).padStart(2, "0")}</h3>
            <span>MINUTES</span>
          </div>
          <div className="box">
            <h3>{String(timeLeft.seconds).padStart(2, "0")}</h3>
            <span>SECONDS</span>
          </div>
        </div>

        <form className="form" onSubmit={notifyWhatsapp}>
          <div className="input-group">
            <input
              type="text"
              placeholder="Your Name"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          </div>

          <div className="input-group">
            <input
              type="tel"
              placeholder="Mobile Number"
              value={mobile}
              maxLength="10"
              onChange={(e) => setMobile(e.target.value.replace(/\D/g, ""))}
            />
          </div>

          <button type="submit" className="btn-3d">
            <span>Notify Me On Launch</span>
          </button>
        </form>
      </div>
    </div>
  );
}

export default App;