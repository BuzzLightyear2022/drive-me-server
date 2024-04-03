export type Users = {
    id?: number,
    username: string,
    hashed_password: string
}

export type VehicleAttributes = {
    id?: number,
    imageFileName?: string | null,
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
    hasJAFCard: boolean,
    JAFCardNumber?: number,
    JAFCardExp?: Date,
    otherFeatures?: string
    createdAt: datetime,
    updatedAt: datetime
}

export type ReservationData = {
    id?: number
    isReplied: boolean,
    receptionDate: Date,
    repliedDatetime: Date,
    salesBranch: string,
    orderHandler: string,
    orderSource: string,
    userNameFurigana: string,
    nonSmoking: string,
    userName: string,
    preferredRentalClass: string,
    isElevatable: boolean,
    isClassSpecified: boolean,
    applicantName: string,
    preferredCarModel: string,
    applicantZipCode: number,
    applicantAddress: string,
    applicantPhoneNumber: number,
    pickupLocation: string,
    returnLocation: string,
    pickupDatetime: Datetime,
    arrivalFlightCarrier: string,
    arrivalFlightNumber: number,
    arrivalFlightTime: time,
    returnDatetime: Datetime,
    departureFlightCarrier: string,
    departureFlightNumber: number,
    departureFlightTime: time,
    selectedRentalClass: string,
    selectedCarModel: string,
    selectedVehicleId: number,
    comment: string,
    isCanceled: boolean
    createdAt: datetime,
    updatedAt: datetime
}

export type VehicleStatus = {
    id?: number,
    vehicleId: number,
    currentLocation: string,
    washState: string,
    comment: string,
    createdAt: Date,
    updatedAt: Date
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

export type LicensePlatesData = {
    id: number,
    licensePlate: string
}

export interface FilesObject {
    [fieldname: string]: Express.Multer.File[];
}