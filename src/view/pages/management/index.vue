<template>
  <div class="rounded p-4 card no-border el-table-transparent">
    <el-row type="flex" :gutter="20" class="pt-3 pb-4 px-3">
      <el-col :span="12">
        <TableTitle>角色管理</TableTitle>
      </el-col>
      <el-col :span="12" class="px-2 text-right">
        <el-button size="medium" type="indigo" @click="dialogVisible"
          >添加角色</el-button
        >
      </el-col>
    </el-row>
    <el-form class="inline-edit">
      <el-table :data="tableData">
        <el-table-column
          label="序号"
          type="index"
          width="150px"
        ></el-table-column>
        <el-table-column prop="role_name" label="角色名称">
          <template v-slot="scope">
            <!-- 新建或者编辑 -->
            <el-form-item v-if="inputVal == scope.row.id">
              <el-input
                size="medium"
                v-model="scope.row.role_name"
                v-focus
                @keydown.enter.native="handleSave(scope.row)"
                class="inputStyle"
              ></el-input>
            </el-form-item>
            <span
              v-else
              class="cursor-pointer"
              @click="showDevice(scope.row)"
              >{{ scope.row.role_name }}</span
            >
          </template>
        </el-table-column>
        <el-table-column prop="role_describe" label="角色描述">
          <template v-slot="scope">
            <!-- 新建或者编辑 -->
            <el-form-item v-if="inputVal == scope.row.id">
              <el-input
                size="medium"
                v-model="scope.row.role_describe"
                v-focus
                @keydown.enter.native="handleSave(scope.row)"
                class="inputStyle"
              ></el-input>
            </el-form-item>
            <span
              v-else
              class="cursor-pointer"
              @click="showDevice(scope.row)"
              >{{ scope.row.role_describe }}</span
            >
          </template>
        </el-table-column>
        <el-table-column prop="id" label="权限管理">
          <template v-slot="scope">
            <el-button
              size="mini"
              type="indigo"
              :disabled="!scope.row.id"
              @click="handle_quanxian(scope.row)"
              >权限管理</el-button
            >
          </template>
        </el-table-column>

        <el-table-column
          prop="actions"
          label="操作"
          align="center"
          width="210px"
        >
          <template v-slot="scope">
            <el-form-item v-if="inputVal == scope.row.id">
              <el-button
                size="mini"
                type="indigo"
                @click="handle_sever(scope.row)"
                >保存</el-button>
              <el-popconfirm  
                v-if="inputVal !== ''"
                title="确定要删除吗？"
                @confirm="handle_del(scope.row)"
              >
                <el-button slot="reference" size="mini" type="danger" class="butStyle"
                  >删除</el-button
                >
              </el-popconfirm>
               <el-popconfirm  
                v-else
                title="确定要取消吗？"
                @confirm="handleCancel(scope.row)"
              >
                <el-button slot="reference" size="mini" type="danger" class="butStyle"
                  >取消</el-button
                >
              </el-popconfirm>
            </el-form-item>
            <el-form-item v-else>
              <el-button
                size="mini"
                type="indigo"
                @click="handle_launch(scope.row)"
                >编辑</el-button
              >
              <el-popconfirm
                title="确定要删除吗？"
                @confirm="handle_del(scope.row)"
              >
                <el-button
                  slot="reference"
                  size="mini"
                  type="danger"
                  class="butStyle"
                  >删除</el-button
                >
              </el-popconfirm>
            </el-form-item>
          </template>
        </el-table-column>
      </el-table>
    </el-form>
    <div class="text-right py-3">
      <el-pagination
        background
        layout="prev, pager, next"
        :total="total"
        :current-page.sync="page"
        :page-size="per_page"
        @current-change="page_change">
      </el-pagination>
    </div>
    <div class="home">
      <el-drawer
        title="权限编辑"
        :visible.sync="drawer"
        direction="rtl"
        size="400px"
        :with-header="true"
        :show-close="true"
        ref="closeDrawer"
      >
        <div class="dividerLine">
          <el-divider></el-divider>
        </div>
        <div class="treeStyle">
          <el-tree
            :data="treeData"
            show-checkbox
            node-key="id"
            :default-checked-keys="treeCheckeds"
            :props="defaultProps"
            @check="checkChange"
            @check-change="setChecked"
          >
            <!-- @check="checkChange" -->
          </el-tree>
        </div>
        <div>
          <el-divider></el-divider>
          <div style="dispplay: felx; text-align: center;">
            <el-button size="mini" @click="closeDrawerClose"  class="buttStyle">取消</el-button>
            <el-button size="mini" type="indigo" @click="jurisdiction"
              >保存</el-button
            >
          </div>
        </div>
      </el-drawer>
    </div>
  </div>
</template>

<script>
import AUTH from "@/core/services/store/auth.module";
import ApiService from "@/core/services/api.service";
import CreateForm from "@/view/pages/transpond/CreateForm.vue";
import UpdateForm from "@/view/pages/transpond/UpdateForm.vue";
import TableTitle from "@/components/common/TableTitle.vue";
import { message_success } from "@/utils/helpers";
import {
  defineComponent,
  reactive,
  ref,
  computed,
  onMounted,
  getCurrentInstance,
} from "@vue/composition-api";
export default defineComponent({
  name: "Home",
  components: {
    CreateForm,
    UpdateForm,
    TableTitle,
  },

  setup(props, context) {
    // 字段定义
    let inputVal = ref("0");
    let inputShow = ref(false);
    const tableData = ref([]);
    const treeData = ref([]);
    const drawer = ref(false);
    const treeCheckeds = ref([]);
    let checkedKeyObj = {};
    const per_page = 10;
    const page = 1;
    const data_count= 2;
    const closeDrawer = ref(false);
    let defaultProps = ref({
      children: "child_node",
      label: "customName",
    });
    let paramsPage = reactive({
        page: page ? page : 1,
        limit: 10,
    })
    // 等同于 this
    const self = getCurrentInstance().proxy
    let total = ref(0)
    // 初始化获取数据
    onMounted(() => {
      sbdata();
    });

    // 初始化数据
    const sbdata = () => {
      let query = {
         current_page: paramsPage.page,
          per_page: paramsPage.limit
      }
      ApiService.post(AUTH.local_url + "/user/role/list",query).then(({ data }) => {
        if (data.code == 200) {
          tableData.value = data.data.data;
          total.value = data.data.total; 
        }
      });
    };
    // 获取权限数据  /api/menu/tree
    const treeDateList = (item) => {
      const { id } = item
      ApiService.post(AUTH.local_url + "/menu/role/index",{ role_id:id }).then((result)=>{
        if(result.data.code == 200){
          const resultData = result.data.data || [];
          treeCheckeds.value = resultData;
          checkedKeyObj.menu_ids = resultData
          ApiService.post(AUTH.local_url + "/menu/tree").then(({ data }) => {
            if (data.code == 200) {
              var arr = data.data;
              treeData.value = setTreeData(arr);
            }
          });
        }
      })
      
    };
    // 信息编辑
    const handle_launch = (item) => {
      console.log(item);
      inputVal.value = item.id;
    };
    // 信息保存  /api/user/role/edit     /api/user/role/add
    const handle_sever = (item) => {
        inputVal.value = 1;
      if(item.id == ""){
        let query = {
        role_name: item.role_name,
        role_describe:item.role_describe
       };
        ApiService.post(AUTH.local_url + "/user/role/add", query).then(
        ({ data }) => {
          if (data.code == 200) {
            message_success("添加成功");
            sbdata();
          }
        }
      );
      }else{
      let query = {
        id: item.id,
        role_name: item.role_name,
        role_describe:item.role_describe
      };
      ApiService.post(AUTH.local_url + "/user/role/edit", query).then(
        ({ data }) => {
          if (data.code == 200) {
            message_success("修改成功");
            sbdata();
          }
        }
      );
      }
      
    };
    // 删除信息   /api/user/role/delete
    const handle_del = (item) => {
      ApiService.post(AUTH.local_url + "/user/role/delete", {
        id: item.id,
      }).then(({ data }) => {
        if (data.code == 200) {
          message_success("删除成功");
          sbdata();
        }
      });
    };
    // 权限管理
    const role_id = ref("");
    const handle_quanxian = (items) => {
      treeDateList(items);
      checkedKeyObj.role_id = items.id;
      drawer.value = true;
    };

    //  树形结构转换
    const setTreeData = (source) => {
      let cloneData = JSON.parse(JSON.stringify(source)); // 对源数据深度克隆
      // 数据排序，根据id进行排序展示，在处理国际化的问题
      var len = cloneData.length;
      for (var i = 0; i < len; i++) {
        for (var j = 0; j < len - 1; j++) {
          if (Number(cloneData[j].id) > Number(cloneData[j+1].id)) {  // 比较相邻元素                
            var temp = cloneData[j+1];   //元素交换                
            cloneData[j+1] = cloneData[j];                
            cloneData[j] = temp;            
          }        
        }
        const menuName = cloneData[i].menu_name.toLocaleUpperCase();
        cloneData[i].customName = self.$t("MANAGEMENT.PERMISSION."+menuName);
        const child_node = cloneData[i].child_node || [];
        child_node.map((item)=>{
          const menuChildrenName = item.menu_name.toLocaleUpperCase();
          item.customName = self.$t("MANAGEMENT.PERMISSION."+menuChildrenName);
        })
      }
      return cloneData;
    };
    // 弹框取消
    const closeDrawerClose = () => {
      drawer.value = false;
    };
    // 权限选择  setChecked
    const checkChange = (items, value) => {
      checkedKeyObj.menu_ids = value.checkedKeys;
      console.log(value);
    };
    // 权限节点选择
    const setChecked = (key, checked, deep) => {
      console.log(key);
       console.log(checked);
        console.log(deep); 
    };

    // 权限保存  /api/menu/role/edit
    const jurisdiction = () => {
      ApiService.post(AUTH.local_url + "/menu/role/edit", checkedKeyObj).then(
        ({ data }) => {
          if (data.code == 200) {
            message_success("权限保存成功");
            drawer.value = false;
            sbdata();
          }
        }
      );
    };
    // 分页
    const  page_change=(val)=>{
      setTimeout(()=>{
        paramsPage.page = val
        sbdata();
      }, 500)
    }
  // 新建
    const  dialogVisible =()=>{
      inputVal.value = ''
        tableData.value.unshift({
            id:"",//id
            role_describe: "",//角色描述
            role_name: "",//角色名称
            errors: {
                role_name: ""
            },
        })
      
    }
// 创建业务
    const handleCreate =()=>{
        // 创建时添加一个空数据到 tableData
        tableData.value.unshift({
            id:"",//id
            role_describe: "",//角色描述
            role_name: "",//角色名称
        })
    }
    // 取消编辑或新建
    const  handleCancel = (item)=>{
        // 取消创建的时候删除本条数据
        let index = tableData.value.indexOf(item)
        tableData.value.splice(index, 1)
        
    }
    return {
      paramsPage,
      handleCreate,
      handleCancel,
      dialogVisible,
      page_change,
      checkedKeyObj,
      role_id,
      checkChange,
      setChecked,
      jurisdiction,
      closeDrawerClose,
      setTreeData,
      treeDateList,
      sbdata,
      handle_launch,
      handle_sever,
      treeData,
      treeCheckeds,
      defaultProps,
      drawer,
      closeDrawer,
      handle_del,
      tableData,
      inputShow,
      inputVal,
      handle_quanxian,
      direction: "rtl", //这里设置抽屉从哪个方向滑出
      per_page,
      page,
      data_count,
      total,
    };
  },
});
</script>

<style lang="scss">
.el-input__inner {
  color: aliceblue;
  background: #090944;
  height: 30px;
}
.el-input--medium .el-input__inner {
  height: 30px;
}
.home {
  .el-drawer {
    color: #fff !important;
    font-size: 18px;
    background: #263d8b;
    // outline: none;
    &__body {
      height: 100%;
      // overflow: hidden;
    }
  }
}
.butStyle {
  margin-left: 5px;
 
}
.treeStyle {
  width: 380px;
  height: 450px;
  padding: 0px 10px;
  border-radius:5px ;
  .el-tree {
    background: #263d8b;
    color: rgb(98, 113, 250);
    // :hover{
    //   background: tomato;
    // }
  }
}
.dividerLine {
  margin-top: -23px;
}
.el-tree-node__content:hover{
  background: rgb(15, 14, 63);
  border-radius: 5px;
  line-height: 20px;
}
.el-drawer__header{
  color: #fff;
}
.el-tree-node__label{
  margin-top: -7px;


}
span.el-tree-node__expand-icon .el-icon-caret-right{
   margin-top: -7px;
}
// .is-current{
//   background: chocolate;
// }

.el-tree-node .is-focusable .is-checked{
border-radius: 5px;
}
.buttStyle{
  background: #263d8b;
   
}


.el-tree-node__content>.el-tree-node__expand-icon{
   margin-top: -7px;
}
.el-tree-node .is-current .is-focusable .is-checked{
  background: chocolate;
}
.el-table-transparent .el-button--default {
    color: #6988f0 !important;
    border: #6988f0 1px solid;
}
</style>