<template>
    <ScrollerPage
        :pullcallback="pullcallback"
        :callback="callback"
        ref="infinitescrollDemo"
    >
        <div slot='list'>
            <div
            v-for="(item, index) in items"
            class="row"
            :class="{'grey-bg': index % 2 == 0}"
            :key="index">{{ item }}</div>
        </div>
    </ScrollerPage>
</template>

<script>
import ScrollerPage from '../../../src/scroller-page/index'
export default {
    components:{
        ScrollerPage
    },
    data(){
        return {
            page:1,
            rows:25,
            count:100,
            items: []
      }
    },
    created(){
        this.getData()
    },
    methods:{
        getData(done){
            setTimeout(() => {
                let items = []
                let length = this.items.length;
                for (let i = length+1; i < length + this.rows; i++) {
                    items.push(i + ' - keep walking, be 2 with you.')
                }
                this.items = this.items.concat(items)
                this.page ++
                if(length < this.count){
                    done()
                }else{
                    done(true)
                }
            }, 500)
        },
        loadData(done) {
            this.getData(done);
        },
        pullcallback(){
            this.page = 1;
            this.items = [];
            let t = setTimeout(() => {
                this.getData(done);
                clearTimeout(t);
            }, 500);
        },
        callback(){
            this.getData()
        }
    }
}
</script>

<style>

</style>
