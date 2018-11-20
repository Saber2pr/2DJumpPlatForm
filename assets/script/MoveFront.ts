/*
 * @Author: AK-12
 * @Date: 2018-11-19 22:48:53
 * @Last Modified by: AK-12
 * @Last Modified time: 2018-11-20 15:21:56
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
 *给定极角，极径获取点
 *
 * @export
 * @param {*} rad
 * @param {*} radius
 * @returns
 */
let getPos = (rad: number, radius: number): cc.Vec2 =>
  cc.v2(radius * Math.cos(rad), radius * Math.sin(rad))
/**
 *判断点是否在node上
 *
 * @private
 * @memberof MoveFront
 */
let hasPos = (node: cc.Node, pos: cc.Vec2): boolean =>
  node.getBoundingBox().contains(node.getParent().convertToNodeSpaceAR(pos))
/**
 * convertToWorldSpaceAR
 * @param node
 */
let toWPos = (node: cc.Node) =>
  node.getParent().convertToWorldSpaceAR(node.position)
/**
 * convertToNodeSpaceAR
 * @param node
 */
let toLPos = (node: cc.Node, pos: cc.Vec2): cc.Vec2 =>
  node.getParent().convertToNodeSpaceAR(pos)
/**
 *follow
 * @param follower
 * @param target
 */
let follow = (follower: cc.Node, target: cc.Node) => {
  follower.setPosition(toLPos(follower, toWPos(target)))
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
  private targetBody: cc.RigidBody
  private isHold: Boolean
  private isOnGround: boolean
  private front: Front
  private landImpulse: number
  private portImpulse: number
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
    hero: cc.Node,
    landImpulse: number,
    portImpulse: number
  ) {
    this.leftBtn = leftBtn
    this.rightBtn = rightBtn
    this.upBtn = upBtn
    this.downBtn = downBtn
    this.initPhysicsBody(hero, landImpulse, portImpulse)
    this.initContact()
    return this
  }
  /**
   *listen
   *
   * @memberof MoveFront
   */
  public listen() {
    this.addTouchListener(this.leftBtn, () => {
      this.front = Front.left
    })
    this.addTouchListener(this.rightBtn, () => {
      this.front = Front.right
    })
    this.addTouchListener(this.upBtn, () => {
      this.front = Front.up
    })
    this.addTouchListener(this.downBtn, () => {
      this.front = Front.down
    })
    this.addKeyListener()
  }
  /**
   *initPhysicsBody
   *
   * @private
   * @param {cc.Node} target
   * @param {number} landImpulse
   * @param {number} portImpulse
   * @memberof MoveCtrllor
   */
  private initPhysicsBody(
    target: cc.Node,
    landImpulse: number,
    portImpulse: number
  ) {
    this.targetBody = target.getComponent(cc.RigidBody)
    this.landImpulse = landImpulse
    this.portImpulse = portImpulse
  }
  /**
   *angle
   *
   * @private
   * @param {number} angle
   * @memberof MoveFront
   */
  private apply(impulse: cc.Vec2) {
    this.targetBody.applyLinearImpulse(
      impulse,
      this.targetBody.getWorldCenter(),
      true
    )
  }
  /**
   *step
   *
   * @memberof MoveFront
   */
  public step() {
    if (this.isHold) {
      switch (this.front) {
        case Front.left:
          this.apply(getPos(Math.PI, this.landImpulse))
          break
        case Front.right:
          this.apply(getPos(0, this.landImpulse))
          break
        case Front.up:
          this.isOnGround ? this.jump() : null
          break
        case Front.down:
          this.apply(getPos(-Math.PI / 2, this.portImpulse))
          break
      }
    }
  }
  /**
   *jump
   *
   * @private
   * @memberof MoveCtrllor
   */
  private jump() {
    this.apply(getPos(Math.PI / 2, this.portImpulse))
    this.isOnGround = false
  }
  /**
   *initContact
   *
   * @private
   * @memberof MoveCtrllor
   */
  private initContact() {
    this.targetBody.onBeginContact = () => {
      this.isOnGround = true
    }
  }
  /**
   *addTouchListener
   *
   * @private
   * @param {cc.Node} node
   * @memberof MoveFront
   */
  private addTouchListener(node: cc.Node, callback?: Function) {
    node.on(cc.Node.EventType.TOUCH_START, () => {
      this.isHold = true
      !!callback ? callback() : null
    })
    node.on(cc.Node.EventType.TOUCH_MOVE, event => {
      this.isHold = hasPos(node, event.getLocation())
    })
    node.on(cc.Node.EventType.TOUCH_END, () => {
      this.isHold = false
    })
    node.on(cc.Node.EventType.TOUCH_CANCEL, () => {
      this.isHold = false
    })
  }
  /**
   *addKeyListener
   *
   * @private
   * @param {cc.Node} node
   * @memberof MoveFront
   */
  private addKeyListener() {
    cc.systemEvent.on(cc.SystemEvent.EventType.KEY_DOWN, event => {
      this.isHold = true
      switch (event.keyCode) {
        case cc.macro.KEY.a:
        case cc.macro.KEY.left:
          this.front = Front.left
          break
        case cc.macro.KEY.d:
        case cc.macro.KEY.right:
          this.front = Front.right
          break
        case cc.macro.KEY.w:
        case cc.macro.KEY.up:
          this.front = Front.up
          break
        case cc.macro.KEY.s:
        case cc.macro.KEY.down:
          this.front = Front.down
          break
      }
    })
    cc.systemEvent.on(cc.SystemEvent.EventType.KEY_UP, event => {
      this.isHold = false
    })
  }
}
const { ccclass, property } = cc._decorator
const OPTIONS = cc.Enum({
  NO: 0,
  YES: 1
})
/**
 *Move
 *
 * @export
 * @class Move
 * @extends {cc.Component}
 */

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

  @property({
    type: cc.Integer,
    displayName: '水平冲量模'
  })
  landImpulse: number = 1000

  @property({
    type: cc.Integer,
    displayName: '垂直冲量模'
  })
  portImpulse: number = 30000

  @property({
    type: cc.Enum(OPTIONS),
    displayName: '是否开启摄像机跟随'
  })
  cameraActive = OPTIONS.NO

  MoveFront: MoveFront

  camera: cc.Node

  onLoad() {
    cc.director.getPhysicsManager().enabled = true
    this.MoveFront = new MoveFront(
      this.leftBtn,
      this.rightBtn,
      this.upBtn,
      this.downBtn,
      this.hero,
      this.landImpulse,
      this.portImpulse
    )
    this.camera = cc.Canvas.instance.node.getComponentInChildren(cc.Camera).node
  }

  start() {
    this.MoveFront.listen()
  }

  update() {
    this.MoveFront.step()
    this.cameraActive ? follow(this.camera, this.hero) : null
  }
}
