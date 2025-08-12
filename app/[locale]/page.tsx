import {IntlayerClientProvider, NextPageIntlayer} from "next-intlayer";
import {IntlayerServerProvider} from "react-intlayer/server";
import Home from "@/app/[locale]/home";
import {ClientLayout} from "@/app/[locale]/ClientLayout";
import { QueryProvider } from '@/app/components/providers/QueryProvider';

const Page: NextPageIntlayer = async ({params}) => {
  const {locale} = await params;
  return (
    <IntlayerServerProvider locale={locale}>
      {/*<PageContent/>*/}
      {/*<ServerComponentExample/>*/}

      <IntlayerClientProvider locale={locale}>
        <QueryProvider>
          <ClientLayout>
            <Home/>
          </ClientLayout>
        </QueryProvider>
      </IntlayerClientProvider>
    </IntlayerServerProvider>
  );
}
export default Page;
