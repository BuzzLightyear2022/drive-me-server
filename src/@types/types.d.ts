export type VehicleAttributes = {
    imageFileName: string,
    carModel: string,
    modelCode: string,
    nonSmoking: boolean,
    insurancePriority: boolean,
    licensePlateRegion: string,
    licensePlateCode: string,
    licensePlateHiragana: string,
    licensePlateNumber: string,
    bodyColor: string,
    driveType: string,
    transmission: string,
    rentalClass: string,
    navigation: string,
    hasBackCamera: boolean,
    hasDVD: boolean,
    hasTelevision: boolean,
    hasExternalInput: boolean,
    hasSpareKey: boolean,
    otherFeatures: text
}

export type ReservationData = {
    vehicleId: number,
    reservationName: string,
    rentalCategory: string,
    departureStore: string,
    returnStore: string,
    departingDatetime: Date,
    returnDatetime: Date,
    nonSmoking: string,
    comment: text
}

export type CarCatalog = {
    rentalClass: {
        [rentalClassName: string]: {
            [carModel: string]: {
                modelCode?: string[],
                driveType?: string[],
                transmission?: string[],
                bodyColor?: string[]
            }
        }
    }
}

export interface FilesObject {
    [fieldname: string]: Express.Multer.File[];
}