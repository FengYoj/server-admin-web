interface DriveTypeInf {
    uuid: string
    drive_type: number
    subject_type: number
    language: string
    title: string
}

interface CourseInf {
    uuid: string
    driveTypes: string[]
    type: 'single' | 'judge' | 'multiple'
}