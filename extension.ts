if (Deno.args.length == 1 && Deno.args[0] == "manifest") {
  const manifest = {
    title: "RSS",
    commands: [
      {
        name: "show",
        title: "Show a feed",
        mode: "view",
        params: [
          {
            name: "url",
            type: "string",
          },
        ],
      },
    ],
  };

  console.log(JSON.stringify(manifest));
  Deno.exit(0);
}

import Parser from "npm:rss-parser";
import { formatDistance } from "npm:date-fns";
import { toJson } from "https://deno.land/std@0.203.0/streams/mod.ts";

const { command, params } = await toJson(Deno.stdin.readable) as {
  command: string;
  params: { [key: string]: any };
};

if (command == "show") {
  const url = params.url;

  const feed = await new Parser().parseURL(url);

  const page = {
    type: "list",
    items: feed.items.map((item) => ({
      title: item.title,
      subtitle: item.categories?.join(", ") || "",
      accessories: item.isoDate
        ? [
          formatDistance(new Date(item.isoDate), new Date(), {
            addSuffix: true,
          }),
        ]
        : [],
      actions: [
        {
          title: "Open in browser",
          onAction: {
            type: "open",
            target: item.link,
          },
        },
      ],
    })),
  };

  console.log(JSON.stringify(page));
}
