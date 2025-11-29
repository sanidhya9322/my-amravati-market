import { useEffect } from "react";
import { useLocation } from "react-router-dom";
import ReactGA from "react-ga4";

export default function usePageTracking() {
  const location = useLocation();

  useEffect(() => {
    if (!location) return;

    // Track page views
    ReactGA.send({
      hitType: "pageview",
      page: location.pathname + location.search,
    });

  }, [location]);
}
