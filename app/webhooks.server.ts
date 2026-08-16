
export async function forwardWebhook(
  path: string,
  shopDomain: string,
): Promise<void> {
  const backendUrl = process.env.BACKEND_URL;

  if (!backendUrl) {
    console.error(`[webhook] BACKEND_URL chưa cấu hình, bỏ qua ${path}`);
    return;
  }

  try {
    const response = await fetch(`${backendUrl}/api/webhooks/${path}`, {
      method: "POST",
      headers: {
        Accept: "application/json",
        "X-Shopify-Shop-Domain": shopDomain,
      },
    });

    if (!response.ok) {
      console.error(
        `[webhook] ${path} lỗi cho ${shopDomain} (${response.status}): ${await response.text()}`,
      );
    }
  } catch (error) {
    console.error(`[webhook] ${path} lỗi cho ${shopDomain}:`, error);
  }
}