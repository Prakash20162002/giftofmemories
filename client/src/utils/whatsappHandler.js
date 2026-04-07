const PHONE_NUMBER = "918335934679";

export function triggerWhatsApp(customerName, productName) {
  const message = `Hi Gift of Memories! 📸

I'm interested in purchasing:
*${productName}*

Customer Name: ${customerName}

Please share more details about pricing and availability.

Thank you! 🙏`;

  const encodedMessage = encodeURIComponent(message);
  const whatsappURL = `https://wa.me/${PHONE_NUMBER}?text=${encodedMessage}`;

  window.open(whatsappURL, "_blank");
}

export function triggerServiceWhatsApp(serviceName) {
  const message = `Hi Gift of Memories! 📸

I'm interested in your service:
*${serviceName}*

Please share more details about packages and pricing.

Thank you! 🙏`;

  const encodedMessage = encodeURIComponent(message);
  const whatsappURL = `https://wa.me/${PHONE_NUMBER}?text=${encodedMessage}`;

  window.open(whatsappURL, "_blank");
}

export function triggerBookingWhatsApp(serviceName, packageName, price) {
  const message = `Hi Gift of Memories! 📸

I would like to book:
*Service:* ${serviceName}
*Package:* ${packageName}
*Price:* ₹${price?.toLocaleString("en-IN") || "Contact for price"}

Please confirm availability and next steps.

Thank you! 🙏`;

  const encodedMessage = encodeURIComponent(message);
  const whatsappURL = `https://wa.me/${PHONE_NUMBER}?text=${encodedMessage}`;

  window.open(whatsappURL, "_blank");
}
