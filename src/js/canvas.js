let faces

const init = () => {
    const $ = go.GraphObject.make

    faces = $(go.Diagram, 'facesDiv', {
        'undoManager.isEnabled': true,
    })

    faces.toolManager.draggingTool.isGridSnapEnabled = true

    faces.nodeTemplate = $(
        go.Node,
        'Auto',
        $(go.Shape, 'RoundedRectangle', {
            strokeWidth: 0,
            fill: '#f3f3e3',
            portId: '',
            cursor: 'pointer',
            fromLinkable: true,
            fromLinkableSelfNode: true,
            toLinkable: true,
            toLinkableSelfNode: true,
        }),
        $(go.Picture, {
            cursor: 'pointer',
            name: 'image',
            margin: 8,
            width: 80,
            height: 40,
        }),
        {
            toolTip: $(
                'ToolTip',
                $(go.TextBlock, new go.Binding('text', 'text'))
            ),
        },
        new go.Binding('location', 'loc', go.Point.parse).makeTwoWay(
            go.Point.stringify
        ),
        {
            selectionAdornmentTemplate: $(
                go.Adornment,
                'Auto',
                $(go.Shape, 'RoundedRectangle', {
                    fill: null,
                    stroke: 'dodgerblue',
                    strokeWidth: 4,
                }),
                $(go.Placeholder)
            ),
        }
    )

    faces.linkTemplate = $(
        go.Link,
        {
            toShortLength: 3,
            relinkableFrom: true,
            relinkableTo: true,
        },
        $(go.Shape, {
            isPanelMain: true,
            stroke: 'transparent',
            strokeWidth: 8,
        }),
        $(go.Shape, { isPanelMain: true }),
        $(go.Shape, { toArrow: 'Triangle' }),
        $(
            go.Shape,
            { fromArrow: 'BackwardTriangle' },
            new go.Binding('visible', 'isBiDirectional')
        ),
        {
            mouseEnter: function (e, link) {
                if (link.isSelected) return
                link.elt(0).stroke = 'rgba(0,90,156,0.5)'
            },
            mouseLeave: function (e, link) {
                link.elt(0).stroke = 'transparent'
            },
            click: function (e, link) {
                link.elt(0).stroke = 'transparent'
            },
        }
    )

    faces.addDiagramListener('LinkDrawn', (e) => {
        faces.model.setDataProperty(e.subject.data, 'isBiDirectional', false)

        const iterator = e.subject.toNode.findLinksOutOf()
        while (iterator.next()) {
            const item = iterator.value
            if (item.data.to === e.subject.data.from) {
                faces.remove(e.subject)
                faces.model.setDataProperty(item.data, 'isBiDirectional', true)
            }
        }
    })

    const animatePicture = (node, images) => {
        const picture = node.findObject('image')
        const newSrc = picture.source === images[0] ? images[1] : images[0]
        picture.source = newSrc
    }

    const animateAllPictures = () => {
        faces.nodes.each((node) => {
            const data = faces.model.nodeDataArray.find(
                (n) => n.key === node.key
            )
            if (data) {
                animatePicture(node, data.images)
            }
        })
    }

    setInterval(animateAllPictures, 1000)
}

window.addEventListener('DOMContentLoaded', init)
