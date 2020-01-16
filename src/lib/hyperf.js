layui.define(['view', 'table'], function (exports) {

    let $ = layui.jquery,
        view = layui.view,
        setter = layui.setter,
        LAY_BODY = 'LAY_app_body',
        table = layui.table;

    function empty(str) {
        return (typeof str === "undefined" || str == null || str === "");
    }

    let Hyperf = function (id) {
        this.id = id;
        this.container = $('#' + (id || LAY_BODY));
        this.self = this;
    };

    Hyperf.prototype = {
        msg: {
            /**
             *
             * @param content
             * @param options
             * @param callback
             * @returns {*}
             */
            dialog: function (content, options, callback) {
                return layer.msg(content || '请填写需要显示的内容', options, typeof callback === 'function' ? callback : '');
            },
            /**
             *
             * @param content
             * @param callback
             * @returns {*}
             */
            warning: function (content, callback) {
                return this.dialog(content, {icon: 7}, callback);
            },
            /**
             *
             * @param content
             * @param callback
             * @returns {*}
             */
            success: function (content, callback) {
                return this.dialog(content, {icon: 6}, callback);
            },
            /**
             *
             * @param content
             * @param callback
             * @returns {*}
             */
            error: function (content, callback) {
                return this.dialog(content, {icon: 5}, callback);
            }
        },
        toast: function (content) {
            return this.msg.dialog(content, {}, false);
        },
        confirm: function (content, yes, no, options) {
            return layer.confirm(content || '请填写提示的内容', $.extend({
                btn: ['确定', '取消'],
                icon: 3,
                title: '提示'
            }, options), yes, no);
        },
        alert: function (content, callback, options) {
            return layer.alert(content || '请填写提示的内容', $.extend({
                // icon: 1,
                title: '提示'
            }, options), callback);
        },
        loading: function () {
            return layer.load(3, {
                shade: [0.1, '#fff'] //0.1透明度的白色背景
            });
        },
        close: function (index) {
            return layer.close(index);
        },
        http: {
            request: function (options) {
                let that = this
                    , success = options.success
                    // , error = options.error
                    , request = setter.request
                    , response = setter.response
                ;
                // console.trace();
                // return false;
                // options.url = setter.domain + options.url;
                options.data = options.data || {};
                options.headers = options.headers || {};

                if (request.tokenName) {
                    let sendData = typeof options.data === 'string'
                        ? JSON.parse(options.data)
                        : options.data;

                    //自动给 Request Headers 传入 token
                    options.headers[request.tokenName] = request.tokenName in options.headers
                        ? options.headers[request.tokenName]
                        : (layui.data(setter.tableName)[request.tokenName] || '');
                }

                delete options.success;
                delete options.error;

                let index = options.loading !== false && Hyperf.prototype.loading();

                return $.ajax($.extend({
                    type: 'get'
                    , dataType: 'json'
                    , success: function (res) {
                        //http请求成功回调
                        let statusCode = response.statusCode;
                        //只有 response 的 code 一切正常才执行 done

                        if (res[response.statusName] == statusCode.ok) {
                            typeof options.done === 'function' && options.done(res);
                        }
                        //登录状态失效，清除本地 access_token，并强制跳转到登入页
                        else if (res[response.statusName] == statusCode.logout) {
                            view.exit();
                        }
                        //其它异常
                        else {
                            Hyperf.prototype.msg.error(res.message);//res.code > 0  一般为逻辑性错误
                        }
                        //只要 http 状态码正常，无论 response 的 code 是否正常都执行 success
                        typeof success === 'function' && success(res);
                    }
                    , error: function (e, code) {
                        //http异常回调
                        Hyperf.prototype.msg.error('网络请求异常' + code);
                        setter.debug && console.error("Error: %s (%i) URL:%s", e.statusText, e.status, options.url);
                    }, complete: function (XHR) {
                        index && layer.close(index);
                    }
                }, options));
            },
            post: function (options) {
                this.request($.extend(options, {'type': 'POST'}));
            },
            get: function (options) {
                this.request($.extend(options, {'type': 'GET'}));
            },
            /**
             * 表单自动处理
             * @param obj
             * @param options
             */
            auto: function (obj, options) {

                let form = obj.form;
                if (empty(form)) {
                    console.log('请设置form属性');
                    return false;
                }

                this.request($.extend({
                    url: form.attributes['action'].nodeValue,
                    method: form.attributes['method'].nodeValue || 'POST',
                    data: obj.field
                }, options));
            }
        },
        photo: {
            //单张图片显示
            one: function (src, options) {
                return this.album([{
                    src: src
                }], options);
            },
            //多张张图片显示
            album: function (data, options) {
                layer.photos($.extend({
                    photos: {
                        data: data
                    }
                    , shade: 0.01//背景透明度
                    , closeBtn: 1//是否显示关闭按钮
                    , anim: 5//图片入场方式
                }, options));
            }
        },
        /**
         * 表格
         */
        table: {
            checkStatus: function (id) {
                return table.checkStatus(id);
            },
            render: function (options) {
                return table.render(this.t(options))
            },
            // reload: function (id, options) {
            //     return table.reload(id, this.t(options))
            // },
            t: function (options) {
                //拼装headers信息
                let request = setter.request,
                    headers = {};

                headers[request.tokenName] = (layui.data(setter.tableName)[request.tokenName] || '');

                return $.extend(options, {
                    headers: headers,
                    text: {
                        none: '暂无相关数据'
                    }
                });
            }
        },
        /**
         * 弹层
         * @param options
         * @returns {Class.index}
         */
        popup: function (options) {
            let success = options.success
                , skin = options.skin;

            delete options.success;
            delete options.skin;

            return layer.open($.extend({
                type: 1
                , title: '提示'
                , content: ''
                , id: 'LAY-system-view-popup'
                , skin: 'layui-layer-admin' + (skin ? ' ' + skin : '')
                , shadeClose: true
                , closeBtn: false
                , success: function (layero, index) {
                    let elemClose = $('<i class="layui-icon" close>&#x1006;</i>');
                    layero.append(elemClose);
                    elemClose.on('click', function () {
                        // layer.close(index);
                        Hyperf.prototype.close(index);
                    });
                    typeof success === 'function' && success.apply(this, arguments);
                }
            }, options))
        },
        /**
         * 加载页面
         * @param options
         */
        page: {
            load: function (that) {
                location.hash = $(that).attr('hyperf-load');
            },
            /**
             * 刷新右侧区域
             */
            refresh: function () {
                layui.index.render();
            },
            back: function () {
                history.back();
            },
            forward: function () {
                history.forward();
            }
        },

        auto: {
            info: function (options) {
                if (!(options.hasOwnProperty('data') && options.hasOwnProperty('url') && options.hasOwnProperty('title') && options.hasOwnProperty('view'))) {
                    Hyperf.prototype.msg.error('参数缺失！');
                    return false;
                }

                delete options.success;

                let done = options.done;
                let d = options.data;

                return Hyperf.prototype.popup($.extend({
                    title: '弹窗'
                    , area: ['600px', '480px']
                    , id: 'LAY-popup-user-add'
                    , success: function (layero, index) {
                        let viewIndex = this.id;
                        view(viewIndex).render(options.view).done(function (r) {
                            Hyperf.prototype.http.get({
                                url: options.url,
                                data: d,
                                done: function (res) {
                                    if (res.code > 0) {
                                        Hyperf.prototype.msg.error(res.msg);
                                        return false;
                                    }
                                    typeof done === 'function' && done.apply(this, arguments);
                                }
                            });
                        });
                    }
                }, options));
            },
            api: function (url, id) {
                Hyperf.prototype.http.post({
                    url: url,
                    data: {
                        id: id
                    },
                    done: function (res) {
                        console.log(res);
                        console.log(res.msg);
                        if (res.code > 0) {
                            Hyperf.prototype.msg.error(res.msg);
                        } else {
                            Hyperf.prototype.msg.success(res.msg, function () {
                                Hyperf.prototype.page.refresh();
                            });
                        }
                    }
                });
            }
        }
    };

    let events = {
            del: function (self) {
                let that = $(self),
                    url = that.attr('hyperf-url') || '',
                    id = that.attr('hyperf-del') || '';
                Hyperf.prototype.confirm('确定删除吗？', function (index) {
                    id && url && Hyperf.prototype.auto.api(url, id);
                });
            },
            forbid: function (self) {
                let that = $(self),
                    url = that.attr('hyperf-url') || '',
                    id = that.attr('hyperf-forbid') || '';

                id && url && Hyperf.prototype.auto.api(url, id);
            },
            resume: function (self) {
                let that = $(self),
                    url = that.attr('hyperf-url') || '',
                    id = that.attr('hyperf-resume') || '';
                id && url && Hyperf.prototype.auto.api(url, id);
            },
            /**
             * 图片预览
             * @param othis
             */
            preview: function (othis) {

                let src = $(othis).attr('hyperf-preview');
                if (!src) {
                    // console.log('图片地址为空');
                    return false;
                }

                Hyperf.prototype.photo.one(src);
            },
            /**
             * 相册
             * @param othis
             * @returns {boolean}
             */
            album: function (othis) {
                console.log($(othis).attr('hyperf-album'));

                let src = $(othis).attr('hyperf-album');
                if (!src) {
                    // console.log('图片地址为空');
                    return false;
                }

                Hyperf.prototype.photo.album(src);
            },
        },
        $body = $('body');

    $body.on('click', '[hyperf-del]', function () {
        events['del'] && events['del'].call(this, this);
    }).on('click', '[hyperf-forbid]', function () {
        events['forbid'] && events['forbid'].call(this, this);
    }).on('click', '[hyperf-resume]', function () {
        events['resume'] && events['resume'].call(this, this);
    }).on('click', '[hyperf-load]', function () {
        // events['load'] && events['load'].call(this, this);
        Hyperf.prototype.page.load(this);
        // location.hash = '';
    }).on('click', '[hyperf-refresh]', function () {
        Hyperf.prototype.page.refresh();
    }).on('click', '[hyperf-back]', function () {
        Hyperf.prototype.page.back();
    }).on('click', '[hyperf-forward]', function () {
        Hyperf.prototype.page.forward();
    }).on('click', '[hyperf-preview]', function () {
        events['preview'] && events['preview'].call(this, this);
        return false;
    }).on('click', '[hyperf-album]', function () {
        events['album'] && events['album'].call(this, this);
    });

    exports('hyperf', new Hyperf());
});

