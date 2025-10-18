import { useEffect } from "react";
import { useLocation } from "react-router-dom";
import ReactGA from "react-ga4";

function usePageTracking() {
  const location = useLocation(); // gets the current URL path

  useEffect(() => {
    // Every time the route changes, send a pageview event
    ReactGA.send({
      hitType: "pageview",
      page: location.pathname + location.search, // e.g., "/browse" or "/addproduct?id=123"
    });
  }, [location]); // run this every time the user changes route
}

export default usePageTracking;
