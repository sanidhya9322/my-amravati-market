import { useEffect } from "react";
import { useLocation } from "react-router-dom";
import ReactGA from "react-ga4";
import ReactPixel from "react-facebook-pixel";

export default function usePageTracking() {
  const location = useLocation();

  useEffect(() => {
    if (!location) return;

    // Google Analytics
    ReactGA.send({
      hitType: "pageview",
      page: location.pathname + location.search,
    });

    // Meta Pixel
    ReactPixel.pageView();

  }, [location]);
}