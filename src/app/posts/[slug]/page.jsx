import React from "react";
import { notFound } from "next/navigation";
import Container from "@/components/container";
import Layout from "@/components/layout";
import PostBody from "@/components/post-body";
import PostHeader from "@/components/post-header";
import SectionSeparator from "@/components/section-separator";
import { getPostAndMorePosts } from "@/lib/api";
import Script from "next/script";
import Head from "next/head";

export async function generateMetadata({ params }) {
  const { slug } = params;
  const data = await getPostAndMorePosts(slug, false);
  const post = data?.post;
  return {
    title: post?.title || "",
    description: post?.excerpt || "",
    openGraph: {
      title: post?.title,
      description: post?.excerpt || "",
      images: [
        {
          url: post?.featuredImage?.url,
          width: 800,
          height: 600,
          alt: post?.title,
        },
      ],
    },
  };
}

export default async function Post({ params }) {
  const { slug } = params;
  const data = await getPostAndMorePosts(slug, false);
  const post = data?.post;
  
  if (!post) {
    notFound(); // Return 404 page if the post is not found
  }

  // MGID and AdsKeeper widget logic
  const MGID_HEADER_WIDGET_ID = process?.env?.MGID_HEADER_WIDGET_ID;
  const MGID_IN_ARTICLE_WIDGET_ID = process?.env?.MGID_IN_ARTICLE_WIDGET_ID;
  const MGID_IN_ARTICLE_POSITION = 1 * (process?.env?.MGID_IN_ARTICLE_POSITION);
  const MGID_SIDEBAR_WIDGET_ID = process?.env?.MGID_SIDEBAR_WIDGET_ID;
  const MGID_SMART_WIDGET_WIDGET_ID = process?.env?.MGID_SMART_WIDGET_WIDGET_ID;

  const ADSKEEPER_HEADER_WIDGET_ID = process?.env?.ADSKEEPER_HEADER_WIDGET_ID;
  const ADSKEEPER_IN_ARTICLE_WIDGET_ID = process?.env?.ADSKEEPER_IN_ARTICLE_WIDGET_ID;
  const ADSKEEPER_IN_ARTICLE_POSITION = 1 * (process?.env?.ADSKEEPER_IN_ARTICLE_POSITION);
  const ADSKEEPER_SIDEBAR_WIDGET_ID = process?.env?.ADSKEEPER_SIDEBAR_WIDGET_ID;
  const ADSKEEPER_FEED_WIDGET_ID = process?.env?.ADSKEEPER_FEED_WIDGET_ID;

  const isShowMgidSidebar = MGID_SIDEBAR_WIDGET_ID ? true : false;
  const isShowAdsKeeperSideBar = ADSKEEPER_SIDEBAR_WIDGET_ID ? true : false;

  // Splitting content to insert ads
  let content = post?.content || "";

  let paraArray = content.includes("<p>")? content.split("</p>"):"";
  let newContent = "";
  
  paraArray.length && paraArray.forEach((item, index) => {
    newContent += item;
    if (index === MGID_IN_ARTICLE_POSITION && MGID_IN_ARTICLE_WIDGET_ID) {
      newContent += `<div class="mgid-in_article">
                      <div data-type="_mgwidget" data-widget-id="${MGID_IN_ARTICLE_WIDGET_ID}"></div>
                      <Script id="mgid-in_article" strategy="beforeInteractive">
                        {\`(function(w,q){w[q] = w[q] || [];w[q].push(["_mgc.load"])})(window,"_mgq");\`}
                      </Script>
                     </div>`;
    }
    if (index === ADSKEEPER_IN_ARTICLE_POSITION && ADSKEEPER_IN_ARTICLE_WIDGET_ID) {
      newContent += `<div class="adskeeper-in_article">
                      <div data-type="_mgwidget" data-widget-id="${ADSKEEPER_IN_ARTICLE_WIDGET_ID}"></div>
                      <Script id="adskeeper-in_article" strategy="beforeInteractive">
                        {\`(function(w,q){w[q] = w[q] || [];w[q].push(["_mgc.load"])})(window,"_mgq");\`}
                      </Script>
                     </div>`;
    }
  });

  const mgidSiteId = process?.env?.MGID_SITE_ID;
  const adskeeperSiteId = process?.env?.ADSKEEPER_SITE_ID;

  return (
    <Layout preview={false}>
      <Container>
        <Head>
          <meta property="og:image" content={post.featuredImage?.node?.sourceUrl} />
          {/* Global Site Tag (gtag.js) - Google Analytics */}
          <script
              async
              src={`https://www.googletagmanager.com/gtag/js?id=${process.env.GA_ID}`}
          />
          <script
              dangerouslySetInnerHTML={{
                __html: `
                  window.dataLayer = window.dataLayer || [];
                  function gtag(){dataLayer.push(arguments);}
                  gtag('js', new Date());
                  gtag('config', '${process?.env?.GA_ID}', {
                    page_path: window.location.pathname,
                  });
                `,
              }}
          />
        </Head>
        <article>
          {process.env.GA_ID && (
              <Script
                  strategy="lazyOnload"
                  src={`https://www.googletagmanager.com/gtag/js?id=${process.env.GA_ID}`}
              />
          )}
          {process.env.GA_ID && (
              <Script
                  id={"block_ga_id"}
                  dangerouslySetInnerHTML={{
                    __html: `
                  window.dataLayer = window.dataLayer || [];
                  function gtag(){dataLayer.push(arguments);}
                  gtag('js', new Date());
                  gtag('config', '${process?.env?.GA_ID}', {
                    page_path: window.location.pathname,
                  });
                `,
                  }}
              />
          )}
          <Script src={`https://jsc.mgid.com/site/${process.env.MGID_SITE_ID}.js`}></Script>
          {mgidSiteId && (
            <Script
              src={`https://jsc.mgid.com/site/${mgidSiteId}.js`}
              strategy="lazyOnload"
              // strategy="afterInteractive" // Load when the page is interactive
            />
          )}
          {adskeeperSiteId && (
            <Script
              src={`https://jsc.adskeeper.com/site/${adskeeperSiteId}.js`}
              strategy="lazyOnload"
              // strategy="afterInteractive" // Load when the page is interactive
            />
          )}

          <Script id="custom_mgid_script" strategy="beforeInteractive">
            {`(function(w,q){w[q] = w[q] || [];w[q].push(["_mgc.load"])})(window,"_mgq");`}
          </Script>
                  
          <div className="block-columns block md:flex md:w-full">
            <div
              className="block-column"
              style={{
                flexBasis: isShowAdsKeeperSideBar || isShowMgidSidebar ? "66.66%" : "100%",
              }}
            >
              {MGID_HEADER_WIDGET_ID && (
                <div className="mgid_header">
                  <div data-type="_mgwidget" data-widget-id={MGID_HEADER_WIDGET_ID}></div>
                  <Script id="mgid_header" strategy="beforeInteractive">
                    {`(function(w,q){w[q] = w[q] || [];w[q].push(["_mgc.load"])})(window,"_mgq");`}
                  </Script>
                </div>
              )}
              {ADSKEEPER_HEADER_WIDGET_ID && (
                <div className="adskeeper_header">
                  <div data-type="_mgwidget" data-widget-id={ADSKEEPER_HEADER_WIDGET_ID}></div>
                  <Script id="adskeeper_header" strategy="beforeInteractive">
                    {`(function(w,q){w[q] = w[q] || [];w[q].push(["_mgc.load"])})(window,"_mgq");`}
                  </Script>
                </div>
              )}

              <PostHeader
                title={post.title}
                coverImage={post.featuredImage}
                date={post.date}
                author={post.author}
                categories={post.categories}
              />
              <PostBody content={newContent} />

              <div id="after-content"></div>

              {MGID_SMART_WIDGET_WIDGET_ID && (
                <div className="mgid_smart_widget">
                  <div data-type="_mgwidget" data-widget-id={MGID_SMART_WIDGET_WIDGET_ID}></div>
                  <Script id="mgid_smart_widget" strategy="beforeInteractive">
                    {`(function(w,q){w[q] = w[q] || [];w[q].push(["_mgc.load"])})(window,"_mgq");`}
                  </Script>
                </div>
              )}
              {ADSKEEPER_FEED_WIDGET_ID && (
                <div className="adskeeper_feed">
                  <div data-type="_mgwidget" data-widget-id={ADSKEEPER_FEED_WIDGET_ID}></div>
                  <Script id="adskeeper_feed" strategy="beforeInteractive">
                    {`(function(w,q){w[q] = w[q] || [];w[q].push(["_mgc.load"])})(window,"_mgq");`}
                  </Script>
                </div>
              )}
            </div>

            {(isShowAdsKeeperSideBar || isShowMgidSidebar) && (
              <div className="block-column" style={{ flexBasis: "33.33%" }}>
                {isShowMgidSidebar && (
                  <div className="mgid-sidebar">
                    <div data-type="_mgwidget" data-widget-id={MGID_SIDEBAR_WIDGET_ID}></div>
                    <Script id="mgid-sidebar" strategy="beforeInteractive">
                      {`(function(w,q){w[q] = w[q] || [];w[q].push(["_mgc.load"])})(window,"_mgq");`}
                    </Script>
                  </div>
                )}
                {isShowAdsKeeperSideBar && (
                  <div className="adskeeper-sidebar">
                    <div data-type="_mgwidget" data-widget-id={ADSKEEPER_SIDEBAR_WIDGET_ID}></div>
                    <Script id="adskeeper-sidebar" strategy="beforeInteractive">
                      {`(function(w,q){w[q] = w[q] || [];w[q].push(["_mgc.load"])})(window,"_mgq");`}
                    </Script>
                  </div>
                )}
              </div>
            )}
          </div>
        </article>

        <SectionSeparator />
      </Container>
    </Layout>
  );
}
