import type { HeadersFunction, LoaderFunctionArgs } from "react-router";
import {
  Link,
  Outlet,
  useLoaderData,
  useLocation,
  useRouteError,
} from "react-router";
import { boundary } from "@shopify/shopify-app-react-router/server";
import { AppProvider } from "@shopify/shopify-app-react-router/react";
import { Frame, Navigation } from "@shopify/polaris";

import { authenticate } from "../shopify.server";
import { NavMenu } from "@shopify/app-bridge-react";

export const loader = async ({ request }: LoaderFunctionArgs) => {
  await authenticate.admin(request);

  // eslint-disable-next-line no-undef
  return { apiKey: process.env.SHOPIFY_API_KEY || "" };
};

export default function App() {
  const { apiKey } = useLoaderData<typeof loader>();
  const { pathname } = useLocation();

  return (
    <AppProvider embedded apiKey={apiKey}>
      <Frame>
        <NavMenu>
        <Link to="/app" rel="home">
          Home
        </Link>

        <Link to="/app/rules">
          Rules
        </Link>
      </NavMenu>
        <Outlet />
      </Frame>
    </AppProvider>
  );
}

// Shopify needs React Router to catch some thrown responses, so that their headers are included in the response.
export function ErrorBoundary() {
  return boundary.error(useRouteError());
}

export const headers: HeadersFunction = (headersArgs) => {
  return boundary.headers(headersArgs);
};
