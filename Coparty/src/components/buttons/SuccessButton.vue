<template>
    <button type="submit">
      <slot>
      </slot>
    </button>
</template>

<style scoped>
  button {
  background: #4CAF50;
  color: white;
  font-weight: bold;
  cursor: pointer;
  border: none;
}

button:hover {
  background: #45a049;
}
</style>
