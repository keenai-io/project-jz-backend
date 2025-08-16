import {IntlayerClientProvider, NextPageIntlayer} from "next-intlayer";
import {IntlayerServerProvider} from "react-intlayer/server";
import Home from "@/app/[locale]/home";
import {ClientLayout} from "@/app/[locale]/ClientLayout";

const Page: NextPageIntlayer = async ({params}) => {
  const {locale} = await params;
  return (
    <IntlayerServerProvider locale={locale}>
      {/*<PageContent/>*/}
      {/*<ServerComponentExample/>*/}
      <IntlayerClientProvider locale={locale}>
        <ClientLayout>
          <Home/>
        </ClientLayout>
      </IntlayerClientProvider>
    </IntlayerServerProvider>
  );
}
export default Page;
