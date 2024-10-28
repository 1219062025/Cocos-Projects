import { Component, Label, Node, ProgressBar, v3, _decorator } from "cc";

const { ccclass } = _decorator;

@ccclass("LoadingComponent")
export class LoadingComponent extends Component
{
    private progress:ProgressBar;
    private value:Label;
    private prompt:Label;
    private bar:Node;
    onLoad()
    {
        let node:Node = this.node.getChildByPath("progress");
        if(node) 
        {
            this.bar = node.getChildByName("bar");
            this.progress = node.getComponent(ProgressBar);
        }
        node = this.node.getChildByPath("progress/value");
        if(node) this.value = node.getComponent(Label);
        node = this.node.getChildByPath("progress/prompt");
        if(node) this.prompt = node.getComponent(Label);

        this.bar.setScale(v3(0, 1, 1));
    }

    setProgress(loaded:number, total: number, desc?: string)
    {
        if (desc === void 0) { desc = ""; }
        // if(this.progress) this.progress.progress = loaded / total;
        let t = loaded / total;
        if(t < 0) t = 0;
        else if(t > 1) t = 1;
        this.bar.setScale(v3(t, 1, 1));
        if(this.value) this.value.string = Math.floor(loaded / total * 100).toString() + "%";
        if(this.prompt) this.prompt.string = desc;
    }
}