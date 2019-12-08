layui.define(function (exports) {

    let $ = layui.jquery,
        view = layui.view,
        setter = layui.setter,
        LAY_BODY = 'LAY_app_body';

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
                            Hyperf.prototype.msg.error(res.message);
                        }
                        //只要 http 状态码正常，无论 response 的 code 是否正常都执行 success
                        typeof success === 'function' && success(res);
                    }
                    , error: function (e, code) {
                        // console.log(e);
                        // console.log(code);
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
    };

    exports('hyperf', new Hyperf());
});