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

export type ImageFile = {
    imageData: {
        fieldname: string,
        originalname: string,
        encoding: string,
        minetype: string,
        buffer: string,
        size: string
    }
}