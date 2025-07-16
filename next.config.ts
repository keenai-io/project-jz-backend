import type {NextConfig} from "next";
import {withIntlayer} from "next-intlayer/server";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [{
      hostname: 'images.unsplash.com'
    }],
  }
};

export default withIntlayer(nextConfig);
