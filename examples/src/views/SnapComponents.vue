<template>
  <div class="snap-compontens">
    <nav-bar title="Snapping Components"></nav-bar>
    <div class="scroller-container">
      <div class="item-title border-bottom-1px">时间选择器</div>
      <div class="buttons">
        <div class="button" @click="openDateTime1">{{dateTime}}</div>
        <div class="button" @click="openDateTime2">{{date}}</div>
        <div class="button" @click="openDateTime3">{{time}}</div>
      </div>
      <div class="item-title border-bottom-1px">内容选择器</div>
      <div class="buttons">
        <div class="button" @click="openDateTime4">{{only}}</div>
      </div>
      <div class="item-title border-bottom-1px">城市选择器</div>
      <div class="buttons">
        <div class="button">{{city}}</div>
      </div>
    </div>
  </div>
</template>

<script>
  import NavBar from './NavBar.vue'
  import dateTime from '../components/dataTime/index.js'
  import picker from '../components/picker/index.js'
  export default {
    components: {
      NavBar
    },
    data () {
      return {
        dateTime:'请选择日期时间',
        date:'请选择日期',
        time:'请选择时间',
        only:'单选',
        city:'未开发',
        data:[
          {key:'标题01',value:'205'},
          {key:'标题02',value:'206'},
          {key:'标题03',value:'207'},
          {key:'标题04',value:'208'},
          {key:'标题05',value:'209'},
          {key:'标题06',value:'210'},
          {key:'标题07',value:'211'},
          {key:'标题08',value:'212'},
          {key:'标题09',value:'213'},
          {key:'标题10',value:'214'},
          {key:'标题11',value:'215'},
          {key:'标题12',value:'216'}
        ]
      }
    },
    methods:{
      openDateTime1(){
        dateTime.open({
          type:'yyyy-mm-dd hh:mm:ss',
          beginTime:'2017-01-23 10:22:00',
          overTime:'2058-06-23 23:22:00',
          confirmClick: (e)=>{
            console.log(e);
            this.dateTime = e.line
          }
        })
      },
      openDateTime2(){
        dateTime.open({
          type:'yyyy-mm-dd',
          beginTime:'2017-01-23 12:33',
          overTime:'2059-06-23 22:55',
          confirmClick: (e)=>{
            console.log(e);
            this.date = e.line
          }
        })
      },
      openDateTime3(){
        dateTime.open({
          type:'hh:mm:ss',
          beginTime:'00:00:00',
          overTime:'23:55:00',
          confirmClick: (e)=>{
            console.log(e);
            this.time = e.line
          }
        })
      },
      openDateTime4(){
        picker.open({
          data:this.data,
          confirmClick: (e)=>{
            console.log(e);
            this.only = e.key
          }
        })
      },
    }
  }
</script>
<style lang="stylus">
  .snap-compontens
    .buttons
      padding 20px;
      .button
        background #f0f0f0;
        height 40px;
        line-height 40px;
        border-radius 5px;
        text-align center
        font-size:15px;
        color:#454545;
        margin-bottom 10px;
</style>
