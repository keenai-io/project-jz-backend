import {IntlayerClientProvider, NextPageIntlayer} from "next-intlayer";
import {IntlayerServerProvider} from "react-intlayer/server";
import Home from "@/app/[locale]/home";

const Page: NextPageIntlayer = async ({params}) => {
  const {locale} = await params;
  return (
    <IntlayerServerProvider locale={locale}>
      {/*<PageContent/>*/}
      {/*<ServerComponentExample/>*/}

      <IntlayerClientProvider locale={locale}>
        <Home/>
      </IntlayerClientProvider>
    </IntlayerServerProvider>
  );
}
export default Page;
