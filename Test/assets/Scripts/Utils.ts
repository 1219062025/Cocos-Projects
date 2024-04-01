/** 获取节点能够包容所有子节点的最小矩形的宽、高 */
export function calculateBoundingBox(node) {
  let children = node.children;
  let minX = Infinity;
  let minY = Infinity;
  let maxX = -Infinity;
  let maxY = -Infinity;

  for (let i = 0; i < children.length; i++) {
    let child = children[i];
    let boundingBox = child.getBoundingBoxToWorld();

    if (boundingBox.xMin < minX) {
      minX = boundingBox.xMin;
    }
    if (boundingBox.yMin < minY) {
      minY = boundingBox.yMin;
    }
    if (boundingBox.xMax > maxX) {
      maxX = boundingBox.xMax;
    }
    if (boundingBox.yMax > maxY) {
      maxY = boundingBox.yMax;
    }
  }

  let height = maxX - minX;
  let width = maxY - minY;
  return { width, height };
}

/** 将节点所有的子节点按照原本的布局居中于该节点 */
export function centerChildren(node) {
  let children = node.children;
  let parentPosition = node.getPosition();

  // 计算所有子节点的平均位置
  let totalX = 0;
  let totalY = 0;

  for (let i = 0; i < children.length; i++) {
    let child = children[i];
    let childPosition = child.getPosition();
    totalX += childPosition.x;
    totalY += childPosition.y;
  }

  let averageX = totalX / children.length;
  let averageY = totalY / children.length;

  // 将所有子节点重新定位到父节点的中心位置
  let offsetX = parentPosition.x - averageX;
  let offsetY = parentPosition.y - averageY;

  for (let i = 0; i < children.length; i++) {
    let child = children[i];
    let childPosition = child.getPosition();
    child.setPosition(childPosition.x + offsetX, childPosition.y + offsetY);
  }
}

// 获取节点在世界坐标系中的位置
export function getNodeWorldPosition(node) {
  return node.parent.convertToWorldSpaceAR(node.position);
}

// 获取某个世界坐标在节点所处的局部坐标系中相对位置
export function getNodeParentPosition(node, worldPos) {
  return node.parent.convertToNodeSpaceAR(worldPos);
}

export function setsAreEqual(set1, set2) {
  if (!set1.size || !set2.size) return false;
  if (set1.size !== set2.size) {
    return false;
  }

  const array1 = Array.from(set1).sort();
  const array2 = Array.from(set2).sort();

  for (let i = 0; i < array1.length; i++) {
    if (array1[i] !== array2[i]) {
      return false;
    }
  }

  return true;
}
