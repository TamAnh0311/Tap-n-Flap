cc.Class({
    extends: cc.Component,
    properties: {
        /** Chiều cao tối thiểu ống trên */
        topPipeMinHeight: 100,
        /** Chiều cao ống thấp hơn */
        bottomPipeMinHeight: 100,
        /** Giãn cách trên và dưới của đường ống tối thiểu */
        spacingMinValue: 250,
        /** Khoảng cách thẳng đứng giữa các ống trên và dưới */
        spacingMaxValue: 300,
        /** Nút trên ống */
        topPipe: cc.Node,
        /** Nút ống thấp hơn */
        bottomPipe: cc.Node,
    },

    init(pipeManager) {
        this.pipeManager = pipeManager;
        this._initPositionX();
        this._initPositionY();
    },

    /** Đặt vị trí ban đầu của nút trên trục x */
    _initPositionX(){
        let visibleSize = cc.director.getVisibleSize(); // Kích thước vùng hiển thị của cảnh
        let sceneLeft = -visibleSize.width / 2; // Chùm Canvas nằm ở chính giữa, bên trái của Canvas có kích thước bằng một nửa chiều rộng bên trái của neo.
        let sceneRight = visibleSize.width / 2; // Chùm Canvas nằm ở giữa và bên phải của Canvas có chiều rộng bằng một nửa so với bên phải của neo.
        this.node.x = sceneRight + 300;
        this.recylceX = sceneLeft - Math.max(this.topPipe.width, this.bottomPipe.width);
    },

    /** Đặt vị trí trục y của các đường ống trên và dưới và khoảng cách giữa chúng
 */
    _initPositionY(){
        let visibleSize = cc.director.getVisibleSize();
        let topPipeMaxY = visibleSize.height / 2 - this.topPipeMinHeight;
        let bottomPipeMinY = cc.find("Canvas/ground").y + this.bottomPipeMinHeight; // Prefab không thể nhận được các nút thông qua thanh tra thuộc tính, chỉ tìm kiếm động
        let spacing = this.spacingMinValue + Math.random() * (this.spacingMaxValue - this.spacingMinValue);
        this.topPipe.y = topPipeMaxY - Math.random() * (topPipeMaxY - bottomPipeMinY - spacing);
        this.bottomPipe.y = this.topPipe.y - spacing;
    },

    update(dt) {
        if (!this.pipeManager.isRunning) {
            return;
        }
        // Cập nhật vị trí đường ống trong thời gian thực
        this.node.x += this.pipeManager.pipeMoveSpeed * dt;
        // Vượt quá khu vực hiển thị màn hình, bạn có thể tái chế đối tượng này
        if (this.node.x < this.recylceX) {
            this.pipeManager.recyclePipe(this);
        }
    }
});