layui.define(['form'], function (exports) {
    let $ = layui.$
        // , admin = layui.admin
        // , view = layui.view
        // , setter = layui.setter
        // , table = layui.table
        , form = layui.form
        , hyperf = layui.hyperf;


    // //角色管理
    hyperf.table.render({
        elem: '#LAY-user-back-role'
        , url: '/auth/list' //模拟接口
        , cols: [[
            {type: 'checkbox', fixed: 'left'}
            , {field: 'id', width: 80, title: 'ID', sort: true}
            , {field: 'title', title: '角色名'}
            , {field: 'desc', title: '具体描述'}
            , {title: '操作', width: 150, align: 'center', fixed: 'right', toolbar: '#table-useradmin-admin'}
        ]]
    });

    exports('role', {})
});