import type {NextConfig} from "next";
import {withIntlayer} from "next-intlayer/server";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [{
      hostname: 'lh3.googleusercontent.com'
    }],
  }
};

export default withIntlayer(nextConfig);
