export function getMessageContent(): string {
  const messages: string[] = [
    "🎉 Special offer just for you! Check out our latest discounts!",
    "💰 Don't miss out on today's amazing deals!",
    "🛍️ New arrivals and exclusive offers waiting for you!",
    "⚡ Flash sale happening now! Limited time only!",
    "🎁 Free shipping on all orders this weekend!",
  ];
  
  const randomIndex = Math.floor(Math.random() * messages.length);
  return messages[randomIndex] || "🎉 Special offer just for you!";
}
