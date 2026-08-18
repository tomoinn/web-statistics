<script setup>
</script>
<template>
  <div>
    <h2 class="text-h4 mb-2">Free Statistics for the Web</h2>
    <p class="text-medium-emphasis mb-4"><em>Version 2.0</em></p>
    <p class="mb-4">
      This project aims to produce scientific visualisations, mostly for biological data, which run directly in the web
      browser. As such, it's not trying to do very large scale visualisations, but focuses more on customisation and
      ease of use. It is open source, licensed under the Apache License, Version 2.0. Source code can be
      found on <a href="https://github.com/tomoinn/web-statistics">GitHub</a>.
    </p>
    <h3 class="text-h5 mb-2">Tools</h3>
    <p>
      The <a href="#circular-plot">Circular Plot</a> tool is intended to help circadian rhythm biologists quickly
      visualise a set of peak times on a variable length cycle. It accepts a set of data points along with configuration
      for length of day and histogram bin size, and calculates the <a
        href="https://en.wikipedia.org/wiki/Circular_mean" rel="noopener noreferrer"
        target="_blank" @click.stop>circular mean and vector magnitude</a>. Plots
      can be saved and loaded, and exported as either SVG or PNG images.
    </p>
    <h3 class="text-h5 mt-4 mb-2">Citation</h3>
    <p class="mb-2">If you would like the cite the usage of this tool please use the following:</p>
    <pre v-pre class="pa-4 bg-grey-lighten-4"><code>@misc{web_statistics_circular_plot,
  title = {Free Statistics for the Web: Circular Plot Tool},
  author = {Tom Oinn},
  year = {2026},
  note = {Version 2.0},
  url = {https://github.com/tomoinn/web-statistics#readme}
}</code></pre>
  </div>
</template>
