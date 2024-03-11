window.addEventListener("DOMContentLoaded", () => {

    "use strict";
    let index, parse, query;

    const form = document.getElementById("search");
    const input = document.getElementById("search-input");

    form.addEventListener(
        "submit",
        function (event) {
            event.preventDefault();

            const keywords = input.value.trim();
            if (!keywords) return;

            query = keywords;
            initSearchIndex();
        },
        false,
    );

    function handleEvent(e) {
        console.log(e.type);
    }

    async function initSearchIndex() {
        const request = new XMLHttpRequest();
        request.open("GET", "/index.json");
        request.responseType = "json";
        request.addEventListener (
            "load",
            function () {
                parse = {};
                index = lunr(function () {

                    const documents = request.response;

                    this.ref("href");
                    this.field("title", {
                        boost: 20,
                        usePipeline: true,
                        wildcard: lunr.Query.wildcard.TRAILING,
                        presence: lunr.Query.presence.REQUIRED,
                    });
                    this.field("content", {
                        boost: 15,
                    });
                    this.field("summary", {
                        boost: 10,
                    });
                    this.field("tags", {
                        boost: 5,
                    });

                    documents.forEach(function(doc) {
                      this.add(doc);
                      parse[doc.href] = {
                        title: doc.title,
                        content: doc.content,
                        summary: doc.summary,
                        tags: doc.tags,
                      };
                    }, this);
                });
                search(query);
            },
            false,
        );
        request.addEventListener("error", handleEvent);
        request.send(null);
    }

    function search(keywords) {
        const results = index.search(keywords);

        if ("content" in document.createElement("template")) {

          const target = document.querySelector(".is-search-result");

          while (target.firstChild) target.removeChild(target.firstChild);

          const title = document.createElement("h3");
          title.id = "search-results";
          title.className = "subtitle is-size-3";

          if (results.length == 0)
              title.textContent = `No results found for "${keywords}"`;
          else if (results.length == 1)
              title.textContent = `Found one result for "${keywords}"`;
          else
              title.textContent = `Found ${results.length} results for "${keywords}"`;

          target.appendChild(title);
          document.title = title.textContent;

          const template = document.getElementById("is-search-template");

          results.forEach(function(result) {
            const doc = parse[result.ref];
            const element = template.content.cloneNode(true);

            element.querySelector(".is-read-more")
                .href = doc.href;
            element.querySelector(".is-read-more")
                .textContent = doc.title;
            element.querySelector(".summary")
                .textContent = doc.summary;
            element.querySelector(".tags")
                .textContent = doc.tags;
            target.appendChild(element);

          }, this);
        } else {}
    }
  },
  false,
);
