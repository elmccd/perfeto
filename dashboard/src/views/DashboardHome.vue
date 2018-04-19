<template>
  <div class="row">
    <div class="col-md-12">
      <div class="card">
        <div class="card-body">

          <div class="form-group">
            <label class="form-label">Size</label>
            <div class="selectgroup w-100">
              <label class="selectgroup-item">
                <input type="radio" name="gt" value="1M" class="selectgroup-input" v-model="gt">
                <span class="selectgroup-button">1 month</span>
              </label>
              <label class="selectgroup-item">
                <input type="radio" name="gt" value="7d" class="selectgroup-input" v-model="gt">
                <span class="selectgroup-button">7d</span>
              </label>
              <label class="selectgroup-item">
                <input type="radio" name="gt" value="24h" class="selectgroup-input" v-model="gt">
                <span class="selectgroup-button">24h</span>
              </label>
            </div>
          </div>


          <div class="form-group">
            <label class="form-label">Size</label>
            <div class="selectgroup w-100">
              <label class="selectgroup-item">
                <input type="radio" name="value" value="hour" class="selectgroup-input" v-model="interval">
                <span class="selectgroup-button">hour</span>
              </label>
              <label class="selectgroup-item">
                <input type="radio" name="value" value="day" class="selectgroup-input" v-model="interval">
                <span class="selectgroup-button">day</span>
              </label>
              <label class="selectgroup-item">
                <input type="radio" name="value" value="minute" class="selectgroup-input" v-model="interval">
                <span class="selectgroup-button">minute</span>
              </label>
            </div>
          </div>

          <C3Chart v-if="myChart.data" :config="myChart.config" :data="myChart.data"/>
        </div>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
  import Vue from "vue";
  import C3Chart from "@/components/C3Chart.vue";
  import ajax from "../services/ajax";

  export default Vue.extend({
    name: "home",
    data() {
      return {
        interval: 'hour',
        gt: '24h',
        myChart: {
          data: null,
          config: {
            axis: {
              x: {
                type: 'timeseries',
                tick: {
                  format: '%Y-%m-%d'
                }
              }
            }
          }
        }
      }
    },
    watch: {
      interval(val) {
        console.log(val);
        this.getData();
      },
      gt(val) {
        console.log(val);
        this.getData();
      }
    },
    components: {
      C3Chart
    },
    methods: {
      mapResults(data: any) {
        console.log('data', data);
        return {
          x: 'x',
          columns: [
            ['x', ...data.map((item: any) => item.key)],
            ['dom', ...data.map((item: any) => item.measure.dom.avg)],
            ['dom50', ...data.map((item: any) => item.measure.dom.percentiles['50.0'])],
            ['load', ...data.map((item: any) => item.measure.load.avg)],
            ['load50', ...data.map((item: any) => item.measure.load.percentiles['50.0'])],
            ['count', ...data.map((item: any) => item.count)],
          ]
        }
      },
      getData() {

        ajax.fetch(`/search?i=${this.interval}&gt=${this.gt}&lt=0h&r=h`)
            .then((jsonResponse) => {
              console.log(jsonResponse);
              const {data, ok} = jsonResponse;
              console.log('data', data, ok);
              this.myChart.data = this.mapResults(data) as any;
              console.log('this.myChart.data', this.myChart.data);
            })
      }
    },
    created() {
      this.getData();
    }
  });
</script>
