---
title: Exploring DIY Observability with Vector, ClickHouse, Grafana
pubDate: "Oct 15 2024"
---

There are many observability solutions available today. Every major cloud provider offers one, and I’d guess they’re big money-makers—at least, that’s what it seems like from my experience in Azure. Then there are tools like Datadog and New Relic, which I’ve heard great things about, but their impressive feature sets come at a price. For my personal projects, I’ve always felt reluctant to invest time in these platforms since they would eventually become too costly for my hobby needs. Additionally, based on my experiences, these tools require a significant time investment to get started. While it’s not as time-consuming as rolling out your own solution, it’s certainly not zero effort either.

When I looked at the open-source landscape for DIY observability tooling, I couldn’t find a solution that offered a simple, single-binary install with all the bells and whistles. Observability is inherently complex, involving many moving parts. It always seemed like a big commitment to set up five different components just to monitor my small website. I’ve done it before, and while it was solid after the initial setup, the setup process itself was no small feat.

Recently, I’ve been revisiting the observability space, trying to get a better grasp of each component. I’m more interested in building a solution myself and would rather spend the time understanding how everything works under the hood. I’ve had the chance to explore this area in more detail, thanks to a few free days I had recently.

## Log Shipping

Log shipping involves gathering logs and forwarding them to an analytics database. A key feature of these tools is often the ability to transform log entries before sending them. For example, the process might involve collecting logs from journald, modifying certain properties, enriching them with additional data, and then sending them to an analytics database. The number of integrations available for different log sources varies between tools, and each handles transformations in its own way.

I explored a few tools for this purpose, primarily Vector ([https://vector.dev/](https://vector.dev/)) and Fluent Bit ([https://fluentbit.io/](https://fluentbit.io/)). I ended up choosing Vector for my setup. I don't have a strong reason for this choice, other than that it seemed like a solid piece of software, and I read some positive feedback about it. Vector can act as either an aggregator or an agent, giving it flexibility in how it's deployed.

Both Vector and Fluent Bit also claim to support metric shipping, although I didn’t test that feature. They list Prometheus scraping as a possible input source, which could be a great way to simplify the architecture while still leveraging the vast ecosystem of Prometheus exporters. Of course, they may not be as efficient as dedicated metric collection tools, but I like the idea of consolidating tooling to reduce architectural complexity.

In my setup, Vector worked quite well. I did run into a few challenges and had to spend some time troubleshooting, but I believe most of the issues were due to my own inexperience. One feature that really helped me during the debugging process was the included REPL, which allowed me to interact with log entries and experiment with transformations in real time. Another helpful feature was the ability to send output directly to stdout and run the Vector binary from the terminal with the verbose flag. This made it easier to spot issues, such as problems with database inserts.

## Analytics Database

I decided to try ClickHouse after reading articles and forum posts about its use by companies ranging from giants like Uber to small businesses and individuals. ClickHouse is an open-source columnar database designed for real-time analytics, and it's excellent at handling large volumes of structured data. Its use cases include, but are not limited to, log analysis, data warehousing, and time-series data. It also uses SQL for querying.

The installation process was straightforward, though I didn’t dive into the advanced features necessary for running it in a production environment. I didn’t test the clustered setup or explore backup and restore processes. My primary goal was to ingest some logs and see how complicated the overall system would become.

While ClickHouse's minimum hardware specifications are relatively high, I followed the recommended setup instructions to make the installation easier. However, I came across several discussions about running ClickHouse on resource-constrained environments which would be relevant if I used it for personal projects.

Creating the table for my logs was straightforward. I checked the structured log format and aligned it with the database schema on the ClickHouse side.

## Visualization

For visualizing the data in real time and creating customizable dashboards, I used Grafana, which is a staple in the observability space. Grafana has a plugin for ClickHouse, making integration straightforward. During my exploration, I used it as a frontend for the logs. It was nice to see the full view of the solution in action.

## Outro

Overall, it was a rewarding experience to dive deeper into building an analytics platform and to explore how the architecture would come together. I believe it's entirely feasible to set up a small-scale solution using Vector, ClickHouse, and Grafana to cover most logging, metrics, and alerting needs. At the same time, I can see how much of a journey it would be to become proficient enough with this stack to operate it at scale for a large organization.

I plan to continue exploring observability solutions. For now mostly to find something that would fit my needs for my monitoring my personal projects. with time and experience, I hope to develop the skills necessary to manage these systems professionally as well.
