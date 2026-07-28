<script lang="ts">
  import '$lib/styles/cassava-mono.css';
  import '$lib/styles/cassava-components.css';
  let title = '';
  let content = '';
</script>

<div class="cm-split h-screen">
  <main class="cm-split-main cm-scroll-y flex flex-col pb-20">
    <header class="cm-thumb-header">
      <input type="text" bind:value={title} placeholder="Judul Catatan..." class="cm-input border-none text-2xl font-bold p-0 focus:outline-none" />
    </header>
    <section class="cm-fill cm-edge-padded py-4">
      <textarea bind:value={content} placeholder="Mulai menulis Markdown di sini..." class="w-full h-96 p-2 border border-black font-mono resize-none border-radius-0 focus:outline-none"></textarea>
    </section>
    <div class="cm-thumb-action-bar">
      <button class="cm-btn" on:click={() => history.back()}>Batal</button>
      <button class="cm-btn cm-btn-primary">Simpan</button>
    </div>
  </main>
</div>
