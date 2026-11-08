import Swal from "sweetalert2";
import API from "../api/axios";

// Helper: load Razorpay checkout script
export const loadRazorpayScript = () => {
  return new Promise((resolve) => {
    if (window.Razorpay) {
      resolve(true);
      return;
    }
    const script = document.createElement("script");
    script.src = "https://checkout.razorpay.com/v1/checkout.js";
    script.async = true;
    script.onload = () => resolve(true);
    script.onerror = () => resolve(false);
    document.body.appendChild(script);
  });
};

// Retry payment for an existing pending order
export const retryOrderPayment = async (orderId, { onSuccess, onFailure } = {}) => {
  try {
    const isReady = await loadRazorpayScript();
    if (!isReady || !window.Razorpay) {
      Swal.fire({
        icon: "error",
        title: "Payment Gateway Error",
        text: "Could not load Razorpay gateway. Please check your internet connection.",
        confirmButtonColor: "#059669",
      });
      if (onFailure) onFailure(new Error("Razorpay SDK not loaded"));
      return;
    }

    Swal.fire({
      title: "Connecting Payment Gateway...",
      text: "Please wait while we initialize secure checkout.",
      allowOutsideClick: false,
      didOpen: () => {
        Swal.showLoading();
      },
    });

    const { data } = await API.post(`/orders/${orderId}/retry-payment`);

    Swal.close();

    if (!data?.success) {
      Swal.fire({
        icon: "error",
        title: "Payment Initiation Failed",
        text: data?.message || "Could not initialize payment for this order.",
        confirmButtonColor: "#059669",
      });
      if (onFailure) onFailure(new Error(data?.message));
      return;
    }

    // If order was already paid or covered with zero payable
    if (!data.requiresPayment) {
      Swal.fire({
        icon: "success",
        title: "Order Confirmed!",
        text: "Your order is confirmed and paid.",
        confirmButtonColor: "#059669",
      });
      if (onSuccess) onSuccess(data.order);
      return;
    }

    const rzp = data.razorpay || {};
    let userEmail = "";
    try {
      const stored = JSON.parse(localStorage.getItem("user") || "{}");
      userEmail = stored?.email || "";
    } catch {}

    const options = {
      key: rzp.key || import.meta.env.VITE_RAZORPAY_KEY_ID || "rzp_test_TppGgVggUkbJv4",
      amount: rzp.amount,
      currency: rzp.currency || "INR",
      name: "Grocery Sathi",
      description: rzp.description || `Payment for Order #${data.order?.orderNumber || ""}`,
      order_id: rzp.orderId,
      prefill: {
        name: rzp.prefill?.name || "",
        contact: rzp.prefill?.contact || "",
        email: rzp.prefill?.email || userEmail,
      },
      theme: {
        color: "#059669",
      },
      handler: async function (paymentResponse) {
        try {
          Swal.fire({
            title: "Verifying Payment...",
            text: "Please wait while we confirm your payment.",
            allowOutsideClick: false,
            didOpen: () => {
              Swal.showLoading();
            },
          });

          const verifyRes = await API.post("/orders/verify", {
            razorpayOrderId: paymentResponse.razorpay_order_id,
            razorpayPaymentId: paymentResponse.razorpay_payment_id,
            razorpaySignature: paymentResponse.razorpay_signature,
          });

          if (verifyRes.data?.success) {
            Swal.fire({
              icon: "success",
              title: "Payment Successful!",
              text: `Payment of ₹${(Number(rzp.amount) / 100).toFixed(2)} received. Order is confirmed!`,
              confirmButtonColor: "#059669",
            });
            if (onSuccess) onSuccess(verifyRes.data.order);
          } else {
            Swal.fire({
              icon: "error",
              title: "Verification Failed",
              text: verifyRes.data?.message || "Could not verify payment.",
              confirmButtonColor: "#059669",
            });
            if (onFailure) onFailure(new Error(verifyRes.data?.message));
          }
        } catch (verErr) {
          console.error("Verification error:", verErr);
          Swal.fire({
            icon: "error",
            title: "Verification Error",
            text: verErr.response?.data?.message || "Payment verification failed.",
            confirmButtonColor: "#059669",
          });
          if (onFailure) onFailure(verErr);
        }
      },
      modal: {
        ondismiss: function () {
          Swal.fire({
            icon: "info",
            title: "Payment Incomplete",
            text: "Payment was not completed. You can retry whenever you are ready.",
            confirmButtonColor: "#059669",
          });
          if (onFailure) onFailure(new Error("Dismissed"));
        },
      },
    };

    const rzpInstance = new window.Razorpay(options);
    rzpInstance.on("payment.failed", function (resp) {
      Swal.fire({
        icon: "error",
        title: "Payment Failed",
        text: resp.error?.description || "Payment was declined or cancelled.",
        confirmButtonColor: "#059669",
      });
      if (onFailure) onFailure(resp.error);
    });

    rzpInstance.open();
  } catch (err) {
    console.error("retryOrderPayment error:", err);
    Swal.fire({
      icon: "error",
      title: "Payment Error",
      text: err.response?.data?.message || "Could not start payment process.",
      confirmButtonColor: "#059669",
    });
    if (onFailure) onFailure(err);
  }
};

