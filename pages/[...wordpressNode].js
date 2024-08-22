import { getWordPressProps, WordPressTemplate } from "@faustwp/core";

export default function Page(props) {
  return <WordPressTemplate {...props} />;
}

export function getStaticProps(ctx) {
  return getWordPressProps({ ctx, revalidate: 300 })
    .then((value) => {
      // Check if notFound is true and add revalidate: 1 to retry each time (for scheduled blog posts)
      if (
        value &&
        JSON.stringify(value) ==
          JSON.stringify({
            notFound: true,
          })
      ) {
        return { ...value, revalidate: 1 };
      }

      if ("props" in value) {
        let { props } = value;

        if (props) {
          const postSeo = props?.__TEMPLATE_QUERY_DATA__?.post?.seo;
          const pageSeo = props?.__TEMPLATE_QUERY_DATA__?.page?.seo;

          if (pageSeo) {
            props.seo = pageSeo;
          } else if (postSeo) {
            props.seo = postSeo;
          }
        }
      }

      return {
        ...value,
        revalidate: 300,
      };
    })
    .catch((error) => {
      console.error("WP Node: Error in getStaticProps", error);

      error.message =
        "[WPNode] Error in getStaticProps: " +
        error.message +
        " with status " +
        error?.response?.status;

      // Throw the error
      throw error;

      return { notFound: true, revalidate: 1 };
    });
}

export async function getStaticPaths() {
  return {
    paths: [],
    fallback: "blocking",
  };
}
