<template>
  <div class="home rounded chartbox no-border overflow_auto index-page" id="chartpage">
    
    <div class="v-application">
      <v-snackbar v-model="snackbar" top :vertical="vertical">
        {{ text }}
        <template v-slot:action="{ attrs }">
          <v-btn color="indigo" text v-bind="attrs" @click="snackbar = false"> Close </v-btn>
        </template>
      </v-snackbar>
      
      <!--新增面板模态框-->
      <v-dialog v-model="paneldialog" max-width="600">
        <v-form ref="form" v-model="valid" lazy-validation @submit.stop.prevent="onPanel">
          <v-card class="card">
            
            <v-card-title>
              <h5 class="headline text-white">
                {{ $t("COMMON.NEWCHARTUNIT") }}
              </h5>
            </v-card-title>
            
            <v-card-text>
              <v-container>
                <v-row>
                  <v-col cols="12" xs="12" md="6">
                    <div class="text-title">{{ $t("COMMON.ASSETS") }}：</div>
                    <treeselect
                      v-model="asset_id"
                      :multiple="false"
                      :clearable="false"
                      :searchable="false"
                      :options="assarr"
                      placeholder="请选择"
                      :normalizer="normalizer"
                      class="treeselect strtreesel charttree mt-2"
                      @input="changeass(asset_id)"
                    />
                  </v-col>
                  <v-col cols="12" xs="12" md="6">
                    <div class="text-title">{{ $t("COMMON.EQUIPMENT") }}：</div>
					<el-select v-model="device_id" @change="changeStr(device_id)" :popper-append-to-body="true" class="width-100 vselect">
					  <el-option v-for="(t, index) in devicearr" :key="index" :value="t.id" :label="t.name"></el-option>
					</el-select>
                  </v-col>
                  <v-col cols="12" xs="12" md="12">
                    <div class="text-title">{{ $t("COMMON.CHARTUNIT") }}：</div>
                    <v-row style="margin-top: 20px;">
                      <v-col cols="12" xs="12" md="4" v-for="(w, p) in equarr" class="cursor-pointer" >
                        <div class="text-center text-white" :class="w.activeclass" @click="chooseChart(w.key, p)" style="overflow: hidden" >
                          <div class="my-2">{{ w.name }}</div>
                        </div>
                      </v-col>
                    </v-row>
                  </v-col>
                </v-row>
              </v-container>
            </v-card-text>

            <v-card-actions>
              <v-spacer></v-spacer>
              <v-btn
                text
                @click.stop="paneldialog = !paneldialog"
                class="canclebtn"
                >{{ $t("COMMON.CANCEL") }}</v-btn
              >
              <v-btn class="confbtn" text @click="onPanel">{{
                $t("COMMON.SAVE")
              }}</v-btn>
            </v-card-actions>
          </v-card>
        </v-form>
      </v-dialog>
    </div>
    
    <div class="left-nav" id="left-nav" v-show="isShowLeftNav">
      <div class="logobox">
        <img src="/media/logos/logo-light.png" alt="" class="headerlogo" />
      </div>
      <ul class="left-nav-ul">
        <li v-for="(proitem, index) in proitems" v-key="proitem" class="left-nav-li">
          <a harf="javascript:;" @click="choosesel(proitem.id)" :class="proitem.id == proid ? 'ative-li' : ''">
              {{ proitem.name }}
           </a>
          <ul v-if="proitem.children" class="pl-1 left-nav-ul">
            <li v-for="item in proitem.children" v-key="item" class="left-nav-li">
              <a harf="javascript:;" @click="choosesel(item.id)" :class="item.id == proid ? 'ative-li' : ''">
                  {{ item.name }}
              </a>
            </li>
          </ul>
        </li>
      </ul>
    </div>
    
    <div id="chart-right">
        <div class="rounded p-4 v-application display-block v-application--is-ltr" >
            <div>
            <!--配置图表单元按钮-->
                <div class="float-left">
                    <div class="text-white float-left" style="height: 56px; line-height: 56px; margin-right: 20px;">
                    {{ $t('COMMON.PLACEHOLDER35') }}: 
                    </div>
                    <div class="float-left">
                        <el-select
                            v-model="entity_id"
                            :popper-append-to-body="false"
                            class="width-100"
                            :placeholder="$t('COMMON.PLACEHOLDER35')"
                            @change="onChangeEqlist(entity_id)"
                        >
                            <el-option
                            v-for="(e, index) in equlist"
                            :key="e.latesttime"
                            :value="e.id"
                            :label="e.name"
                            />
                        </el-select>
                    </div>
                </div>
                
                <div class="expantdiv text-right inlineblock float-right" v-show="isshowtheme" >
                    <div
                        class="symbol symbol-40 symbol-light-default mt-2 cursor-pointer mr-2"
                        @click="addpanel"
                    >
                        <span class="symbol-label bg-blue">
                            <inline-svg src="media/svg/icons/Navigation/Plus.svg" class="h-100 align-self-end text-white" />
                        </span>
                    </div>
                    <div
                        class="symbol symbol-40 symbol-light-default mt-2 cursor-pointer mr-2"
                        @click="getFullCreeen"
                        v-show="isshowfull"
                    >
                        <span class="symbol-label bg-blue">
                            <inline-svg :src="expandicon" class="h-100 align-self-end text-white" />
                        </span>
                    </div>
                </div>
            
                <div
                    class="expantdiv text-right inlineblock float-right"
                    v-show="isslectshow"
                    @click="clickSelectBox"
                >
                    <div class="symbol symbol-40 symbol-light-default mt-2 cursor-pointer mr-2">
                        <span class="symbol-label bg-blue">
                            <i class="fa text-white" :class="eleicon"></i>
                        </span>
                    </div>
                </div>
            </div>
            <div v-show="showSelect" class="slectbox">
                <div>
                    <div class="wid-16 float-left" v-show="isqtshow">
                    <el-select
                        v-model="dateindex"
                        @change="changeFilter"
                        :popper-append-to-body="false"
                        class="width-100"
                    >
                        <el-option
                        v-for="(b, index) in datefilter"
                        :key="index"
                        :value="b.id"
                        :label="b.name"
                        ></el-option>
                    </el-select>
                    </div>
                    <div class="clear"></div>
                </div>
                <div>
                    <div class="wid-10 float-left" v-show="ptisshow">
                        <v-app-bar-nav-icon @click.stop="dialog = !dialog" class="btnbox">牲畜管理</v-app-bar-nav-icon>
                    </div>
                </div>
            </div>
        </div>
        
        <dashboard
            :colorStart="themes[themesIndex].colorStart"
            :colorEnd="themes[themeIndex].colorEnd"
            :bgcolor="chartthemes[themeIndex].bgcolor"
            :busid="business_id"
            :proid="proid"
            :chart_id="chart_id"
            :assest_id="entity_id"
            :start_time="strdate"
            :end_time="enddate"
            :latest_time="dateindex"
            :role="role"
        />
      
        <!--移动端资产模态框-->
        <v-dialog
            v-model="dialog"
            max-width="500px"
            append-to-body="true"
            class="navdialog"
        >
            <v-card>
                <v-card-title class="position-relative">
                    <span class="headline font-size-h3">牲畜管理</span>
                    <span
                    class="svg-icon svg-icon-primary svg-icon-md closedialog pointer"
                    @click="Close"
                    >
                    <inline-svg
                        src="media/svg/icons/Code/Error-circle.svg"
                    ></inline-svg>
                    </span>
                </v-card-title>
                
                <v-card-text>
                    <v-container>
                    <v-row class="scrow">
                        <ul class="scul_1">
                        <li v-for="items in proitems" class="scli_1">
                            <div class="sctitle_1" @click="choosesel(items.id)">
                                <span
                                    class="svg-icon svg-icon-primary svg-icon-md mapicon pointer"
                                    @click="Close"
                                >
                                    <inline-svg src="media/svg/icons/Map/Compass.svg"></inline-svg>
                                </span>
                                {{ items.name }}
                                <span
                                    class="svg-icon svg-icon-md closedialog pointer"
                                    @click="Close"
                                >
                                    <inline-svg src="media/svg/icons/Navigation/Angle-right.svg"></inline-svg>
                                </span>
                            </div>
                            
                            <ul v-if="items.children" class="scul_2">
                            <li v-for="v in items.children" class="scli_2">
                                <div class="sctitle_2" @click="choosesel(v.id)">
                                    <span class="svg-icon svg-icon-primary svg-icon-md mapiconpointer" @click="Close">
                                        <inline-svg src="media/svg/icons/Map/Compass.svg"></inline-svg>
                                    </span>
                                    {{ v.name }}
                                    <span class="svg-icon svg-icon-md closedialog pointer" @click="Close">
                                        <inline-svg src="media/svg/icons/Navigation/Angle-right.svg"></inline-svg>
                                    </span>
                                </div>
                            </li>
                            </ul>
                            
                        </li>
                        </ul>
                    </v-row>
                    </v-container>
                    
                </v-card-text>
            </v-card>
        </v-dialog>
    </div>
  </div>
</template>

<script>
import { REFRESH } from "@/core/services/store/auth.module";

import AUTH from "@/core/services/store/auth.module";
import ApiService from "@/core/services/api.service";

import Dashboard from "@/view/pages/chart/dashboard";
import themes from "@/config/themes";
import chartthemes from "@/config/chartthemes";
import bgthemes from "@/config/bgtheme";

// import the component
import Treeselect from "@riophae/vue-treeselect";
// import the styles
import "@riophae/vue-treeselect/dist/vue-treeselect.css";
import "@/assets/css/style.css";
import "./Chart.scss";

import Utils from "@/utils/util.js";
import { SET_AUTH } from "../../../core/services/store/auth.module";
// import moment from "moment";
// import zh from "moment/locale/zh-cn";
// moment.updateLocale("zh-cn", zh);
export default {
  data() {
    return {
      equlist: [],
      entity_id: "",
      isShowLeftNav: false,
      dialog: false,
      busitems: [],
      busindex: 0,
      proitems: [],
      proindex: 0,
      busid: "",
      proid: null,
      strdate: "",
      enddate: "",
      themes,
      chartthemes,
      bgthemes,
      themeIndex: 0,
      themesIndex: 0,
      n: 0,
      expandicon: "media/svg/icons/General/Expand-arrows.svg",
      dateindex: 0,
      datefilter: [
        {
          id: 0,
          name: "关闭实时数据",
        },
        {
          id: 1,
          name: "最后 1 minutes",
        },
        {
          id: 5,
          name: "最后 5 minutes",
        },
        {
          id: 15,
          name: "最后 15 minutes",
        },
        {
          id: 30,
          name: "最后 30 minutes",
        },
        {
          id: 60,
          name: "最后 1 hour",
        },
        {
          id: 180,
          name: "最后 3 hours",
        },
        {
          id: 360,
          name: "最后 6 hours",
        },
        {
          id: 720,
          name: "最后 12 hours",
        },
        {
          id: 1440,
          name: "最后 24 hours",
        },
      ],
      switch1: false,
      isshow: true,
      xsisshow: true,
      ptisshow: false,
      drawer: false,
      isqtshow: false,
      pcisshow: true,
      isslectshow: false,
      eleicon: "fa-chevron-up",
      showSelect: false,
      localeConfig: {
        "zh-cn": {
          dow: 0,
          dir: "ltr",
          lang: {
            label: "ZH-CN",
            submit: "确定",
            cancel: "取消",
            now: "现在",
          },
        },
      },
      isshowtheme: true,
      isshowfull: true,
      paneldialog: false,
      panelarr: [
        {
          business_id: "",
          assarr: [],
          widget: [
            {
              device_id: null,
              widget_identifier: "",
              equarr: [],
            },
          ],
        },
      ],
      busarr: [],
      text: "",
      vertical: true,
      snackbar: false,
      isedit: 0,
      chart_id: "",
      business_id: "",
      assarr: [],
      asset_id: null,
      device_id: "",
      widget_identifier: "",
      equarr: [],
      valid: true,
      devicearr: [],
      bgindex: 0,
      role: 0,
    };
  },
  components: {
    Dashboard,
    Treeselect,
  },
  created() {
    this.chart_id = this.$route.query.chart_id;
    this.business_id = this.$route.query.business_id;
    this.changebuss(this.business_id);
    console.log("图表id");
    console.log(this.chart_id);
    this.gettime();
    this.getEqlist(this.business_id);
    /*this.getbusiness();
			  Utils.$emit('demo', this.busid, this.proid);*/
  },
  mounted() {
    var _this = this;
    document.addEventListener("webkitfullscreenchange", function (e) {
      if (!e.currentTarget.webkitIsFullScreen) {
        _this.outFullCreeen(document);
        _this.expandicon = "media/svg/icons/General/Expand-arrows.svg";
      } else {
        console.log("进入webkitIsFullScreen");
      }
    });
  },
  methods: {
    onChangeEqlist(id) {
		this.entity_id = id;
    },
    getEqlist(id) {
      let _that = this;
      ApiService.post(AUTH.local_url + "/asset/list", {
        business_id: id,
      })
        .then(({ data }) => {
          console.log("资产编辑列表");
          console.log(data);
          if (data.code == 200) {
            var arr = data.data;
            _that.equlist = arr;
			_that.entity_id = arr[0].id;
          } else {
            this.$store.dispatch(REFRESH).then(() => {});
          }
        })
        .catch(({ response }) => {
          console.log(response);
        });
    },
    // treeselect值重定义
    normalizer(node) {
      return {
        id: node.id,
        label: node.name,
      };
    },
    choosesel(value, instanceId) {
      console.log("input更改");
      console.log(value);
      this.proid = value;
      console.log(this.proid);
      if (this.dialog == true) {
        this.dialog = false;
      }
      // this.getproperty();
      Utils.$emit("demo", this.busid, this.proid);
      // Dashboard.methods.getDashboard(this.busid,this.proid);
    },
    getbusiness() {
      ApiService.post(AUTH.local_url + "/dashboard/business").then(
        ({ data }) => {
          console.log("获取业务");
          console.log(data);
          if (data.code == 200) {
            this.busitems = data.data;
            var defaultbusid = data.data[0]["id"];

            ApiService.post(AUTH.local_url + "/auth/me").then(({ data }) => {
              if (data.code == 200) {
                console.log(data);
                this.role = data.data.is_admin;
                if (data.data.is_admin == 1) {
                  // 普通用户
                  this.busid = data.data.business_id;
                  this.isshow = false;
                  this.changeBus(data.data.business_id);
                  if (window.screen.width < 768) {
                    // 响应式
                    this.xsisshow = false;
                    this.ptisshow = true;
                  } else {
                    // pc端
                    this.isShowLeftNav = true;
                    this.xsisshow = false;
                    console.log(document.getElementById("kt_aside"));
                    document.getElementById("kt_aside").classList.add("hide");
                    document
                      .getElementById("kt_wrapper")
                      .classList.add("pad-lef-0");
                    document
                      .getElementById("left-nav")
                      .classList.add("wid-265");
                    document
                      .getElementById("chart-right")
                      .classList.add("wid-container");
                    document
                      .getElementsByClassName("container")[0]
                      .classList.add("wid-100");
                    document
                      .getElementsByClassName("container")[0]
                      .classList.remove("container");
                    this.ptisshow = false;
                    this.isqtshow = true;
                    this.pcisshow = false;
                  }
                } else {
                  this.busid = defaultbusid;
                }
                this.getproperty();
                this.gettime(); //调取时间
              } else {
                this.$store.dispatch(REFRESH).then(() => {});
              }
            });
            // Dashboard.methods.getDashboard(data.data[0]['id']);
          } else if (data.code == 401) {
            this.$store.dispatch(REFRESH).then(() => {});
          } else {
          }
        }
      );
    },
    getproperty() {
      ApiService.post(AUTH.local_url + "/dashboard/property", {
        wid: this.busid,
      }).then(({ data }) => {
        console.log("获取资产");
        console.log(data);
        if (data.code == 200) {
          const arr = data.data;
          /*var obj = {id: "0", label: "全部", name: "全部"};
						          arr.unshift(obj);
						          console.log(arr);*/
          this.proitems = JSON.parse(JSON.stringify(arr));
          this.proid = data.data[0]["id"];
          console.log("传送值");
          console.log(this.busid);
          console.log(this.proid);
          Utils.$emit("demo", this.busid, this.proid);
          // Dashboard.methods.getDashboard(this.busid,this.proid);
        } else if (data.code == 401) {
          this.$store.dispatch(REFRESH).then(() => {});
        } else {
        }
      });
    },
    gettime() {
      console.log("获取时间");
      ApiService.post(AUTH.local_url + "/dashboard/gettime", {
        chart_id: this.chart_id,
      }).then(({ data }) => {
        console.log("获取时间");
        console.log(data);
        if (data.code == 200) {
          /*this.strdate='2020-09-04T14:23';
						      this.enddate='2020-09-04T15:23';*/
          this.strdate = data.data.config.start_time;
          this.enddate = data.data.config.end_time;
          this.themeIndex = data.data.config.theme;
          this.dateindex = data.data.config.interval_time;
          this.bgindex = data.data.config.bg_theme;
          this.changebgcolor();
          Dashboard.methods.getDashboard(this.chart_id);
        } else if (data.code == 401) {
          this.$store.dispatch(REFRESH).then(() => {});
        } else {
        }
      });
    },
    // 替换背景颜色
    changebgcolor() {
      this.$nextTick(function () {
        console.log("背景颜色");
        console.log(this.bgthemes[this.bgindex]["bgcolor"]);
        var bgcolors = this.bgthemes[this.bgindex]["bgcolor"];
        console.log(document.getElementById("chartpage"));
        document.getElementById("chartpage").style.backgroundColor = bgcolors;
        if (this.bgindex == 1) {
          document.getElementById("chartpage").classList.add("airquality");
        }
      });
    },
    // 选择主题颜色
    changeThemes(selVal) {
      console.log(selVal);
      console.log(document.getElementsByClassName("dropdown-menu"));
      document
        .getElementsByClassName("dropdown-menu")[2]
        .classList.remove("show");
      this.themeIndex = selVal;
      this.inserttime();
    },

    // 选择背景颜色
    changeBgThemes(selVal) {
      console.log(selVal);
      console.log(document.getElementsByClassName("dropdown-menu"));
      document
        .getElementsByClassName("dropdown-menu")[3]
        .classList.remove("show");
      this.bgindex = selVal;
      this.inserttime();
    },

    inserttime() {
      if (this.strdate != "" && this.enddate != "") {
        ApiService.post(AUTH.local_url + "/dashboard/inserttime", {
          chart_id: this.chart_id,
          start_time: this.strdate,
          end_time: this.enddate,
          theme: this.themeIndex,
          interval_time: this.dateindex,
          bg_theme: this.bgindex,
        }).then(({ data }) => {
          console.log("插入时间");
          console.log(data);
          if (data.code == 200) {
            this.changebgcolor();
          } else if (data.code == 401) {
            this.$store.dispatch(REFRESH).then(() => {});
          } else {
          }
        });
      }
    },
    changeBus(selVal) {
      console.log("selVal");
      console.log(selVal);
      this.busid = selVal;
      this.getproperty();
      this.gettime();
      // Dashboard.methods.getDashboard(this.busid);
    },

    // 获取实时筛选
    changeFilter(selVal) {
      Utils.$emit("demo", this.busid, this.proid);
      console.log(selVal);
      this.dateindex = selVal;
      if (selVal > 0) {
        var url = AUTH.local_url + "/dashboard/realTime";
        ApiService.post(url, {
          type: this.dateindex,
        }).then(({ data }) => {
          console.log("获取实时筛选");
          console.log(data);
          if (data.code == 200) {
            if (data.data.start_time) {
              var stime = data.data.start_time;
              stime = stime.split(" ");
              this.strdate = stime[0] + "T" + stime[1];
            }
            if (data.data.end_time) {
              var etime = data.data.end_time;
              etime = etime.split(" ");
              this.enddate = etime[0] + "T" + etime[1];
            }
            this.inserttime();
          } else if (data.code == 401) {
            this.$store.dispatch(REFRESH).then(() => {});
          } else {
          }
        });
      }
      this.inserttime();
    },
    // 点击放大缩小按钮
    getFullCreeen() {
      this.n++;
      this.n % 2 == 0
        ? this.outFullCreeen(document)
        : this.inFullCreeen(document.getElementById("chartpage"));
      this.n % 2 == 0
        ? (this.expandicon = "media/svg/icons/General/Expand-arrows.svg")
        : (this.expandicon = "media/svg/icons/General/Scale.svg");
    },
    // 全屏显示
    inFullCreeen(element) {
      // 全屏
      let el = element;
      console.log("打开全屏");
      console.log(el);
      let rfs =
        el.requestFullScreen ||
        el.webkitRequestFullScreen ||
        el.mozRequestFullScreen ||
        el.msRequestFullScreen ||
        el.fullScreen ||
        el.mozFullScreen ||
        el.webkitIsFullScreen;
      if (typeof rfs != "undefined" && rfs) {
        rfs.call(el);
      } else if (typeof window.ActiveXObject != "undefined") {
        let wscript = new ActiveXObject("WScript.Shell");
        if (wscript != null) {
          wscript.SendKeys("{F11}");
        }
      }
      this.isslectshow = false; //全屏显示眼睛图标
      this.eleicon = "fa-chevron-down";
      this.showSelect = false; //全屏隐藏select筛选
      this.isshowtheme = false;
      this.isshowfull = false;
    },
    // 退出全屏
    outFullCreeen(element) {
      console.log("退出全屏");
      // 退出全屏
      let el = element;
      let cfs =
        el.cancelFullScreen ||
        el.webkitCancelFullScreen ||
        el.mozCancelFullScreen ||
        el.exitFullScreen;
      if (typeof cfs != "undefined" && cfs) {
        cfs.call(el);
      } else if (typeof window.ActiveXObject != "undefined") {
        let wscript = new ActiveXObject("WScript.Shell");
        if (wscript != null) {
          wscript.SendKeys("{F11}");
        }
      }
      this.isslectshow = false; //退出全屏隐藏眼睛图标
      this.showSelect = true; //退出全屏显示select筛选
      this.isshowtheme = true;
      this.isshowfull = true;
      this.isshow = true;
    },
    // 关闭模态框
    Close() {
      this.dialog = false;
    },

    clickSelectBox() {
      if (this.showSelect == false) {
        this.showSelect = true;
        this.eleicon = "fa-chevron-up";
      } else {
        this.showSelect = false;
        this.eleicon = "fa-chevron-down";
      }
    },

    // 打开面板模态框
    addpanel() {
      ApiService.post(AUTH.local_url + "/dashboard/list", {
        chart_id: this.chart_id,
      }).then(({ data }) => {
        console.log("获取面板列表");
        console.log(data);
        if (data.code == 200) {
          if (data.data.length > 0) {
            // 编辑
            this.isedit = 1;
            this.panelarr = data.data;
          } else {
            // 新增
            this.isedit = 0;
            this.panelarr = [
              {
                business_id: "",
                assarr: [],
                widget: [
                  {
                    device_id: null,
                    widget_identifier: "",
                    equarr: [],
                  },
                ],
              },
            ];
          }
          this.paneldialog = true;
        } else if (data.code == 401) {
          this.$store.dispatch(REFRESH).then(() => {});
        } else {
        }
      });
    },

    // 调取业务数据
    /*busData(){
			    ApiService.post(AUTH.local_url + "/dashboard/business")
			      .then(({data}) => {
			        console.log('获取业务列表');
			        console.log(data);
			        if (data.code == 200) {
			          this.busarr = data.data;
			        } else if (data.code == 401) {
			          console.log('跳转登录页面');
			          this.$store
			                  .dispatch(LOGOUT)
			                  .then(() => this.$router.push({name: "login"}));
			        } else {

			        }
			      });
			  },*/

    // 选择业务
    changebuss(id) {
      console.log(id);
      console.log("资产列表");
      ApiService.post(AUTH.local_url + "/dashboard/property", {
        wid: id,
      }).then(({ data }) => {
        console.log("获取资产");
        console.log(data);
        if (data.code == 200) {
          this.assarr = data.data;
        } else if (data.code == 401) {
          this.$store.dispatch(REFRESH).then(() => {});
        } else {
        }
      });
    },

    //获取设备数据
    changeass(id) {
      console.log(id);
      if (id !== undefined) {
        ApiService.post(AUTH.local_url + "/dashboard/device", {
          asset_id: id,
        }).then(({ data }) => {
          console.log("获取组件内容");
          console.log(data);
          if (data.code == 200) {
            this.devicearr = data.data;
          } else if (data.code == 401) {
            this.$store.dispatch(REFRESH).then(() => {});
          } else {
            alert(data.msg);
          }
        });
      }
    },

    // 新增业务列表
    addpanellist(i) {
      var obj = {
        business_id: "",
        assarr: [],
        widget: [
          {
            device_id: null,
            widget_identifier: "",
            equarr: [],
          },
        ],
      };
      this.panelarr.push(obj);
    },

    // 删除业务列表
    delpanellist(i, id) {
      var con = confirm("确定要删除该数据吗？");
      if (con == true) {
        if (id == undefined) {
          this.panelarr.splice(i, 1);
        } else {
          this.deletepan(id, 1);
          this.panelarr.splice(i, 1);
        }
      }
    },

    // 删除面板数据
    deletepan(id, type) {
      ApiService.post(AUTH.local_url + "/dashboard/delete", {
        id: id,
        type: type,
      }).then(({ data }) => {
        console.log("删除面板");
        console.log(data);
        if (data.code == 200) {
          this.text = "删除成功！";
          this.snackbar = true;
        } else if (data.code == 401) {
          this.$store.dispatch(REFRESH).then(() => {});
        } else {
        }
      });
    },

    // 新增设备列表
    addequlist(index, i) {
      var obj = {
        device_id: null,
        widget_identifier: "",
        equarr: [],
      };
      this.panelarr[index]["widget"].push(obj);
    },

    // 删除设备列表
    delequlist(index, i, id) {
      var con = confirm("确定要删除该数据吗？");
      if (con == true) {
        if (id == undefined) {
          this.panelarr[index]["widget"].splice(i, 1);
        } else {
          this.deletepan(id, 2);
          this.panelarr[index]["widget"].splice(i, 1);
        }
      }
    },

    //提交面板配置
    submitpanel() {
      var data = JSON.stringify(this.panelarr);
      console.log(data);
      if (this.isedit == 0) {
        // 新增
        ApiService.post(AUTH.local_url + "/dashboard/add", {
          data: data,
        }).then(({ data }) => {
          console.log("提交资产");
          console.log(data);
          if (data.code == 200) {
            console.log("添加成功！");
            this.text = "面板新增成功！";
            this.snackbar = true;
            this.paneldialog = false;
          } else if (data.code == 401) {
            this.$store.dispatch(REFRESH).then(() => {});
          } else {
          }
        });
      } else {
        // 编辑
        ApiService.post(AUTH.local_url + "/dashboard/edit", {
          data: data,
        }).then(({ data }) => {
          console.log("提交资产");
          console.log(data);
          if (data.code == 200) {
            console.log("更改成功！");
            this.text = "面板编辑成功！";
            this.snackbar = true;
            this.paneldialog = false;
          } else if (data.code == 401) {
            this.$store.dispatch(REFRESH).then(() => {});
          } else {
          }
        });
      }
    },

    changeStr(id) {
      ApiService.post(AUTH.local_url + "/dashboard/component", {
        device_id: id,
      }).then(({ data }) => {
        console.log("获取图表内容");
        console.log(data);
        if (data.code == 200) {
          var arr = data.data;
          for (var i = 0; i < arr.length; i++) {
            arr[i]["activeclass"] = "chartborder";
          }
          this.equarr = arr;
        } else if (data.code == 401) {
          this.$store.dispatch(REFRESH).then(() => {});
        } else {
          alert(data.msg);
        }
      });
    },

    // 选择图表
    chooseChart(key, index) {
      console.log(key);
      for (var i = 0; i < this.equarr.length; i++) {
        this.equarr[i]["activeclass"] = "chartborder";
      }
      this.equarr[index]["activeclass"] = "chart_active";
      this.widget_identifier = key;
      console.log(this.equarr);
    },

    // 新增图表提交
    onPanel() {
      var chart_id = this.chart_id;
      var asset_id = this.asset_id;
      var device_id = this.device_id;
      var widget_identifier = this.widget_identifier;

      if (asset_id == "") {
        alert("请选择资产！");
        return fales;
      }
      if (device_id == null) {
        alert("请选择设备！");
        return false;
      }
      if (widget_identifier == null) {
        alert("请选择图表！");
        return false;
      }
      ApiService.post(AUTH.local_url + "/dashboard/add", {
        chart_id: chart_id,
        asset_id: asset_id,
        device_id: device_id,
        widget_identifier: widget_identifier,
      }).then(({ data }) => {
        console.log("添加图表");
        console.log(data);
        if (data.code == 200) {
          this.paneldialog = false;
          window.location.reload(); //刷新当前页面
        } else if (data.code == 401) {
          this.$store.dispatch(REFRESH).then(() => {});
        } else {
          alert(data.msg);
        }
      });
    },
  },
};
</script>

