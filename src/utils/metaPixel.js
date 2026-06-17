import ReactPixel from "react-facebook-pixel";

const PIXEL_ID = "2548641895595040";

export const initMetaPixel = () => {
  ReactPixel.init(PIXEL_ID);
};

export const trackPageView = () => {
  ReactPixel.pageView();
};

export const trackEvent = (name, data = {}) => {
  ReactPixel.track(name, data);
};