/*
 * @Author: AK-12
 * @Date: 2018-10-30 22:46:42
 * @Last Modified by: AK-12
 * @Last Modified time: 2018-11-20 14:35:45
 */
/**
 * 给定点和最大极径，限制点的活动范围
 * @param commitPos
 * @param limitRadius
 */
let limitToCircle = (commitPos: cc.Vec2, limitRadius: number): cc.Vec2 =>
  getLength(commitPos) < limitRadius
    ? commitPos
    : getPos(getAngle(commitPos), limitRadius)
/**
 * 给定点获取其极角(弧度)
 * @param Pos
 */
let getAngle = (Pos: cc.Vec2): number =>
  Pos.y > 0 ? Math.acos(Pos.x / Pos.mag()) : -Math.acos(Pos.x / Pos.mag())
/**
 *给定极角，极径获取点
 *
 * @export
 * @param {*} angle
 * @param {*} radius
 * @returns
 */
let getPos = (rad: number, radius: number): cc.Vec2 =>
  cc.v2(radius * Math.cos(rad), radius * Math.sin(rad))
/**
 *给定点，获取极径
 *
 * @export
 * @param {*} commitPos
 * @returns
 */
let getLength = (commitPos: cc.Vec2): number => commitPos.mag()
/**
 * 弧度转角度
 * @param angle
 */
let radToAngle = (angle: number): number => (angle * 180) / Math.PI
/**
 * convertToSpace
 * @param origin
 * @param pos
 */
let convertToSpace = (origin: cc.Vec2, pos: cc.Vec2) =>
  cc.v2(pos.x - origin.x, pos.y - origin.y)
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
 * angleLimited
 * @param angle
 * @param min
 * @param max
 * @param callback
 */
let angleLimited = (
  angle: number,
  min: number,
  max: number,
  stepIn_callback?: Function,
  stepOut_callback?: Function
) => {
  if (radToAngle(angle) > min && radToAngle(angle) < max) {
    !!stepIn_callback ? stepIn_callback() : null
  } else {
    !!stepOut_callback ? stepOut_callback() : null
  }
}
/**
 *MoveCtrllor
 *
 * @export
 * @class MoveCtrllor
 */
class MoveCtrllor {
  private angle: number
  private status: boolean
  private targetBody: cc.RigidBody
  private isOnGround: boolean
  private isJumped: boolean
  private __ANCHOR__: cc.Vec2
  private landImpulse: number
  private portImpulse: number
  /**
   *Creates an instance of MoveCtrllor.
   * @param {cc.Node} basicNode
   * @param {cc.Node} touchNode
   * @param {cc.Node} target
   * @param {number} landImpulse
   * @param {number} portImpulse
   * @memberof MoveCtrllor
   */
  constructor(
    basicNode: cc.Node,
    touchNode: cc.Node,
    target: cc.Node,
    landImpulse: number,
    portImpulse: number
  ) {
    this.refresh(touchNode)
    this.__ANCHOR__ = toWPos(basicNode)
    this.addListener(basicNode, touchNode)
    this.initPhysicsBody(target, landImpulse, portImpulse)
    this.initContact()
  }
  /**
   *添加监听
   * @param basicNode
   * @param touchNode
   */
  private addListener(basicNode: cc.Node, touchNode: cc.Node) {
    basicNode.on('touchstart', event => {
      this.status = true
      this.update(basicNode, touchNode, event)
      this.isJumped = false
    })
    basicNode.on('touchmove', event => {
      this.update(basicNode, touchNode, event)
      angleLimited(
        this.angle,
        45,
        135,
        () => {
          this.isOnGround && !this.isJumped ? this.jump() : null
        },
        () => {
          this.isJumped = false
        }
      )
    })
    basicNode.on('touchend', () => {
      this.refresh(touchNode)
    })
    basicNode.on('touchcancel', () => {
      this.refresh(touchNode)
    })
  }
  /**
   * 更新touchNode位置
   * @param basicNode
   * @param touchNode
   * @param event
   */
  private update(basicNode: cc.Node, touchNode: cc.Node, event) {
    let localPoint = convertToSpace(this.__ANCHOR__, event.getLocation())
    let touch_limited = limitToCircle(localPoint, basicNode.width / 2)
    touchNode.setPosition(touch_limited)
    this.angle = getAngle(touch_limited)
  }
  /**
   * 重置状态
   * @param touchNode
   */
  private refresh(touchNode: cc.Node) {
    this.angle = 0
    this.status = false
    touchNode.setPosition(0, 0)
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
   *jump
   *
   * @private
   * @memberof MoveCtrllor
   */
  private jump() {
    if (this.angle < 90) {
      this.targetBody.applyLinearImpulse(
        getPos(this.angle, this.portImpulse),
        this.targetBody.getWorldCenter(),
        true
      )
    } else {
      this.targetBody.applyLinearImpulse(
        getPos(this.angle, this.portImpulse),
        this.targetBody.getWorldCenter(),
        true
      )
    }
    this.isOnGround = false
    this.isJumped = true
  }
  /**
   *move
   *
   * @private
   * @memberof MoveCtrllor
   */
  private move() {
    this.targetBody.applyLinearImpulse(
      cc.v2(getPos(this.angle, this.landImpulse).x, 0),
      this.targetBody.getWorldCenter(),
      true
    )
  }
  /**
   *step
   *
   * @param {*} node
   * @memberof MoveCtrllor
   */
  public step(): void {
    if (this.status === true) {
      this.move()
    }
  }
}
const { ccclass, property } = cc._decorator
const OPTIONS = cc.Enum({
  NO: 0,
  YES: 1
})
/**
 *creator接口
 *
 * @export
 * @class MoveBoot
 * @extends {cc.Component}
 */
@ccclass
export default class MoveBoot extends cc.Component {
  @property({
    type: cc.Node,
    displayName: '轮盘拖动点'
  })
  touch: cc.Node = null

  @property({
    type: cc.Node,
    displayName: '角色节点'
  })
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

  moveCtrllor: MoveCtrllor

  camera: cc.Node

  onLoad() {
    cc.director.getPhysicsManager().enabled = true
    this.moveCtrllor = new MoveCtrllor(
      this.node,
      this.touch,
      this.hero,
      this.landImpulse,
      this.portImpulse
    )
    this.camera = cc.Canvas.instance.node.getComponentInChildren(cc.Camera).node
  }
  update() {
    this.moveCtrllor.step()
    this.cameraActive ? follow(this.camera, this.hero) : null
  }
}
