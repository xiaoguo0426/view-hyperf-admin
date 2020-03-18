layui.define(['form'], function (exports) {
    let $ = layui.$
        , form = layui.form
        , laytpl = layui.laytpl
        , hyperf = layui.hyperf;
    //角色管理
    let tableIndex = hyperf.table.render({
        elem: '#LAY-product-list'
        , url: '/product/product/list' //模拟接口
        , page: false //开启分页
        , cols: [[
            {
                type: 'checkbox', fixed: 'left'
            }
            , {
                field: 'title', title: '分类名称', align: 'left', templet: function (d) {
                    return d.spl + d.title;
                }
            }
            , {field: 'sort', title: '排序', align: 'center'}
            , {field: 'status', title: '状态', align: 'center', templet: '#table-product-status'}
            , {title: '操作', width: 250, align: 'center', fixed: 'right', toolbar: '#table-product-actions'}
        ]]
    });

    //监听搜索
    form.on('submit(LAY-product-search)', function (data) {
        var field = data.field;
        //执行重载
        tableIndex.reload({
            where: field,
            page: {
                curr: 1 //重新从第 1 页开始
            }
        });
    });

    //事件
    let events = {
        info: function (that) {
            let id = $(that).attr('lay-id') || '';
            let popup = hyperf.auto.info({
                data: {
                    id: id
                },
                url: '/product/product/info',
                title: id ? '编辑商品' : '添加商品',
                view: 'product/product/product-form',
                success: function (res) {
                    let data = res.data;

                    let categoryTpl = document.getElementById('product-category-select-tpl'),
                        categorySelect = document.getElementById('product-category-select');

                    laytpl(categoryTpl.innerHTML).render({
                        id: data.id,
                        parent_id: data.parent_id,
                        categories: data.categories
                    }, function (html) {
                        categorySelect.innerHTML = html;
                    });

                    form.val('category-form', data);
                    form.render(null, 'category-form');

                    form.render('select', 'parent_id');

                    //监听提交
                    form.on('submit(product-form-submit)', function (data) {
                        let fields = data.field; //获取提交的字段

                        hyperf.http.post({
                            url: id ? '/product/product/edit' : '/product/product/add',
                            data: fields,
                            done: function (res) {
                                hyperf.msg.success(res.msg, function () {
                                    hyperf.close(popup);
                                });
                                tableIndex.reload({
                                    page: {
                                        curr: 1 //重新从第 1 页开始
                                    }
                                });
                            }
                        });
                    });
                }
            });
        }
    };

    $('body').on('click', '[lay-event]', function () {
        let $this = $(this),
            event = $this.attr('lay-event');
        events[event] && events[event].call(this, $this);
    });

    $('[name=logo]').uploadOneImage(function () {
        console.log(23)
    });
    exports('product-product', {})
});