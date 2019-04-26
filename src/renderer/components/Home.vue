<template>
  <div>
    <sui-menu top fixed compact icons color="'red'"  >
       <sui-menu-menu position="left">
         <sui-menu-item>
           <div>
             <sui-button circular basic icon="plus"/>
             <sui-button circular basic icon="search"/>
           </div>
         </sui-menu-item>
       </sui-menu-menu>
         <sui-menu-item header>Eplee</sui-menu-item>
       <sui-menu-menu position="right">
         <sui-menu-item>
           <div>
             <sui-button circular basic icon="window minimize"/>
             <sui-button circular basic icon="square outline"/>
             <sui-button circular basic icon="close"/>
           </div>
         </sui-menu-item>
       </sui-menu-menu>
    </sui-menu>

    <sui-container class="main" >
       <sui-card-group>
        <card/>
        <card/>
        <card/>
        <card/>
        <card/>
        <card/>
        <card/>
        <card/>
        <card/>
       </sui-card-group>
    </sui-container>
  </div>
</template>

<script>
import Card from '@/renderer/components/Home/Card';

export default {
  name: 'Home',
  components: {
    Card,
  },
};
</script>

<style>
#left {
  left: 20px;
  /* display: inline-block; */
  align-self: flex-start;
  -webkit-app-region: no-drag;
}
#center {
  display: inline-block;
  margin: auto;
  /* width: -webkit-fill-available; */
  text-align: center;
}
#right {
  display: inline-block;
  right: 20px;
  -webkit-app-region: no-drag;
}

#titlebar {
  position: fixed;
  top: 0px;
  width: -webkit-fill-available;
  margin: 0px;
  padding: 10px;
  -webkit-app-region: drag;
  user-select: none;
  background: #ffffff;
  justify-content: space-between;
  /* align-items: center; */
}

#lib {
  display: flex;
  flex-wrap: wrap;
  justify-content: space-around;
  align-content: flex-start;
}

::-webkit-scrollbar {
  display: none;
}
</style>
