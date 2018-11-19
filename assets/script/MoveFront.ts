/*
 * @Author: AK-12
 * @Date: 2018-11-19 22:48:53
 * @Last Modified by: AK-12
 * @Last Modified time: 2018-11-19 22:59:09
 */
/**
 *Front
 *
 * @enum {number}
 */
enum Front {
  left,
  right,
  up,
  down
}
/**
 *MoveFront
 *
 * @class MoveFront
 */
class MoveFront {
  private leftBtn: cc.Node
  private rightBtn: cc.Node
  private upBtn: cc.Node
  private downBtn: cc.Node
  private hero: cc.Node
  private isHold: Boolean
  private front: Front
  /**
   *Creates an instance of MoveFront.
   * @param {cc.Node} leftBtn
   * @param {cc.Node} rightBtn
   * @param {cc.Node} upBtn
   * @param {cc.Node} downBtn
   * @param {cc.Node} hero
   * @memberof MoveFront
   */
  constructor(
    leftBtn: cc.Node,
    rightBtn: cc.Node,
    upBtn: cc.Node,
    downBtn: cc.Node,
    hero: cc.Node
  ) {
    this.leftBtn = leftBtn
    this.rightBtn = rightBtn
    this.upBtn = upBtn
    this.downBtn = downBtn
    this.hero = hero
    return this
  }
  /**
   *listen
   *
   * @memberof MoveFront
   */
  public listen() {
    this.addListener(this.leftBtn, () => {
      this.front = Front.left
    })
    this.addListener(this.rightBtn, () => {
      this.front = Front.right
    })
    this.addListener(this.upBtn, () => {
      this.front = Front.up
    })
    this.addListener(this.downBtn, () => {
      this.front = Front.down
    })
  }
  /**
   *step
   *
   * @memberof MoveFront
   */
  public step() {
    if (this.isHold) {
      cc.log('hold: ', this.front)
    }
  }
  /**
   *addListener
   *
   * @private
   * @param {cc.Node} node
   * @memberof MoveFront
   */
  private addListener(node: cc.Node, callback?: Function) {
    node.on(cc.Node.EventType.TOUCH_START, () => {
      this.isHold = true
      !!callback ? callback() : null
    })
    node.on(cc.Node.EventType.TOUCH_MOVE, event => {
      this.isHold = this.hasPos(node, event.getLocation())
    })
    node.on(cc.Node.EventType.TOUCH_END, () => {
      this.isHold = false
    })
    node.on(cc.Node.EventType.TOUCH_CANCEL, () => {
      this.isHold = false
    })
  }
  /**
   *判断点是否在node上
   *
   * @private
   * @memberof MoveFront
   */
  private hasPos = (node: cc.Node, pos: cc.Vec2): boolean =>
    node.getBoundingBox().contains(node.getParent().convertToNodeSpaceAR(pos))
}

const { ccclass, property } = cc._decorator

@ccclass
export default class Move extends cc.Component {
  @property(cc.Node)
  leftBtn: cc.Node = null
  @property(cc.Node)
  rightBtn: cc.Node = null
  @property(cc.Node)
  upBtn: cc.Node = null
  @property(cc.Node)
  downBtn: cc.Node = null
  @property(cc.Node)
  hero: cc.Node = null

  MoveFront: MoveFront

  onLoad() {
    this.MoveFront = new MoveFront(
      this.leftBtn,
      this.rightBtn,
      this.upBtn,
      this.downBtn,
      this.hero
    )
  }

  start() {
    this.MoveFront.listen()
  }

  update() {
    this.MoveFront.step()
  }
}
