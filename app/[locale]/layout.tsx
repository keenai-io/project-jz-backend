export {generateStaticParams} from "next-intlayer"; // Line to insert
import type {NextLayoutIntlayer} from "next-intlayer";
import {Inter} from "next/font/google";
import {getHTMLTextDir, getIntlayer} from "intlayer";
import { ClientLayout } from './ClientLayout';

const inter = Inter({subsets: ["latin"]});

const LocaleLayout: NextLayoutIntlayer = async ({children, params}) => {
  const {locale} = await params;
  const content = getIntlayer("layout", locale);

  return (
    <html lang={locale} dir={getHTMLTextDir(locale)}>
      <body className={inter.className}>
        <ClientLayout content={content}>
          {children}
        </ClientLayout>
      </body>
    </html>
  );
};

export default LocaleLayout;
