const SUPPORTED_IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/bmp']

let facesArray

const onChangeImageUpload = (fileInput) => {
    if (fileInput.files.length) {
        fillFacesArray(fileInput.files)
        displayNodes()
    }
    fileInput.value = ''
}

const fillFacesArray = (files) => {
    const faceGroups = {}

    Array.from(files)
        .filter((file) => SUPPORTED_IMAGE_TYPES.includes(file.type))
        .forEach((file) => {
            const faceName = file.webkitRelativePath.split('/')[1]
            if (!faceGroups[faceName]) faceGroups[faceName] = []
            faceGroups[faceName].push(URL.createObjectURL(file))
        })

    facesArray = []
    Object.keys(faceGroups).forEach((name) => {
        facesArray.push({ name, images: faceGroups[name] })
    })

    facesArray.sort((a, b) => a.name.localeCompare(b.name))
}

const displayNodes = () => {
    const faceNodes = facesArray.map((face, index) => ({
        key: index,
        images: face.images,
        text: `${index} - ${face.name}`,
        name: face.name,
    }))

    diagram.model = new go.GraphLinksModel(faceNodes, [])
}

const onClickSaveArduino = () => {
    if (!facesArray) {
        window.alert('No faces to export')
        return
    }
    download('facesConfig.h', generateConfigFile())
}

const generateConfigFile = () => {
    let mappings = generateMappings()
    const maxLinks = getMaxLinks(mappings)
    const fileMappings = generateFileMappings(mappings, maxLinks)

    return `#define NUMBER_FACES ${facesArray.length}
#define INVALID_FACE -1
${generateDefines()}\n
const int8_t nextFaces[][${maxLinks}] = {
${fileMappings}};\n`
}

const generateDefines = () => {
    return facesArray
        .map((face, index) => `#define ${face.name.toUpperCase()} ${index}`)
        .join('\n')
}

const getMaxLinks = (mappings) => {
    return Object.values(mappings).reduce(
        (acc, cur) => Math.max(acc, cur.length),
        0
    )
}

const addMapping = (map, key, mapping) => {
    if (!map[key]) map[key] = []
    map[key].push(mapping.name.toUpperCase())
}

const generateMappings = () => {
    const mappings = {}

    diagram.nodes.each((node) => {
        const iterator = node.findLinksOutOf()
        while (iterator.next()) {
            const item = iterator.value
            addMapping(mappings, item.data.from, facesArray[item.data.to])

            if (item.data.isBiDirectional) {
                addMapping(mappings, item.data.to, facesArray[item.data.from])
            }
        }
    })

    return mappings
}

const generateFileMappings = (mappings, max) => {
    const fullMappings = {}

    Object.keys(mappings).forEach((key) => {
        fullMappings[key] = mappings[key].concat(
            Array(max - mappings[key].length).fill('INVALID_FACE')
        )
    })

    let fileMappings = ''

    facesArray.forEach((face, index) => {
        if (!fullMappings[index]) {
            fullMappings[index] = Array(max).fill('INVALID_FACE')
        }
        fileMappings += `  {${fullMappings[index].join(', ')}}`
        if (index !== facesArray.length - 1) fileMappings += ','
        fileMappings += ` //${face.name.toUpperCase()}\n`
    })
    return fileMappings
}

const download = (filename, text) => {
    const blob = new Blob([text], { type: 'text/plain' })
    const url = URL.createObjectURL(blob)

    const a = document.createElement('a')
    a.setAttribute('href', url)
    a.setAttribute('download', filename)
    a.style.display = 'none'
    document.body.appendChild(a)

    a.click()

    document.body.removeChild(a)
    URL.revokeObjectURL(url)
}

const onClickSaveConfiguration = () => {
    const data = JSON.parse(diagram.model.toJson())
    const nodeDataArray = data.nodeDataArray.map(({ images, ...item }) => item)
    data.nodeDataArray = nodeDataArray

    download('facesConfig.json', JSON.stringify(data))
}

const onChangeImport = (importInput) => {
    if (!facesArray?.length) {
        window.alert('Please upload images first')
        importInput.value = ''
        return false
    }

    const files = importInput.files
    const fr = new FileReader()

    fr.onload = (e) => {
        const rawData = JSON.parse(e.target.result)
        const facesArrayObject = facesArray.reduce((previous, current) => {
            previous[current.name] = current.images
            return previous
        }, {})

        Object.entries(rawData.nodeDataArray).forEach((entry) => {
            const [key, node] = entry
            if (facesArrayObject[node.name]) {
                node.images = facesArrayObject[node.name]
            } else {
                delete rawData.nodeDataArray[key]
                rawData.nodeDataArray.length--
            }
        })

        diagram.model = go.Model.fromJson(JSON.stringify(rawData))
        importInput.value = ''
    }

    fr.readAsText(files.item(0))
}
