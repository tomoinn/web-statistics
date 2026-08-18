<script setup>
defineProps({
  page: {
    type: String,
    required: true
  }
});
</script>

<template>
  <div class="navbar navbar-inverse navbar-fixed-top" role="navigation">
    <div class="container">
      <div class="navbar-header">
        <button type="button" class="navbar-toggle" data-toggle="collapse" data-target=".navbar-collapse">
          <span class="sr-only">Toggle navigation</span>
          <span class="icon-bar"></span>
          <span class="icon-bar"></span>
          <span class="icon-bar"></span>
        </button>
        <a class="navbar-brand" href="#">webStats</a>
      </div>
      <div class="collapse navbar-collapse">
        <ul class="nav navbar-nav">
          <li :class="{ active: page === 'home' }">
            <a href="#">Home</a>
          </li>
          <li :class="{ active: page === 'circular-plot' }">
            <a href="#circular-plot">Circular Plot</a>
          </li>
          <li :class="{ active: page === 'about' }">
            <a href="#about">About</a>
          </li>
        </ul>
      </div>
    </div>
  </div>
</template>
